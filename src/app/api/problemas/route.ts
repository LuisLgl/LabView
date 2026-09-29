import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: problemas, error } = await supabase
      .from('PROBLEMAS_COMPUTADORES')
      .select('*, computador:COMPUTADORES(*), responsavel:USUARIOS(*)')
      .order('data_registro', { ascending: false });

    if (error) throw error;
    return NextResponse.json(problemas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar problemas' }, { status: 500 });
  }
}

// Registrar nova ocorrência
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { computador_id, descricao, registrado_por } = body;

    const { data: novo, error: probErr } = await supabase
      .from('PROBLEMAS_COMPUTADORES')
      .insert([{
        computador_id: Number(computador_id),
        descricao,
        registrado_por: registrado_por || undefined,
        status: 'pendente'
      }])
      .select('*, computador:COMPUTADORES(*), responsavel:USUARIOS(*)')
      .single();

    if (probErr) throw probErr;

    // Atualiza computador para manutenção
    await supabase
      .from('COMPUTADORES')
      .update({ status: 'manutencao' })
      .eq('id', Number(computador_id));

    // Encerra sessão ativa do computador se houver
    const { data: sessaoAtiva } = await supabase
      .from('CONTROLE_COMPUTADORES')
      .select('*')
      .eq('computador_id', Number(computador_id))
      .is('fim_uso', null)
      .maybeSingle();

    if (sessaoAtiva) {
      await supabase
        .from('CONTROLE_COMPUTADORES')
        .update({ fim_uso: new Date().toISOString() })
        .eq('id', sessaoAtiva.id);
    }

    return NextResponse.json(novo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao registrar ocorrência' }, { status: 400 });
  }
}

// Resolver ocorrência / concluir reparo
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    const { data: atualizado, error: updErr } = await supabase
      .from('PROBLEMAS_COMPUTADORES')
      .update({
        status: 'resolvido',
        data_resolucao: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updErr) throw updErr;

    // Se não houver outros problemas pendentes, volta status do PC para disponível
    const { data: pendentesRestantes, error: pendErr } = await supabase
      .from('PROBLEMAS_COMPUTADORES')
      .select('*')
      .eq('computador_id', atualizado.computador_id)
      .eq('status', 'pendente');

    if (pendErr) throw pendErr;

    if (!pendentesRestantes || pendentesRestantes.length === 0) {
      await supabase
        .from('COMPUTADORES')
        .update({ status: 'disponivel' })
        .eq('id', atualizado.computador_id);
    }

    return NextResponse.json(atualizado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao resolver ocorrência' }, { status: 400 });
  }
}
