import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: computadores, error: compErr } = await supabase
      .from('COMPUTADORES')
      .select('*')
      .order('id', { ascending: true });

    if (compErr) throw compErr;

    // Buscar sessões ativas com os dados do aluno
    const { data: sessoesAtivas, error: sessErr } = await supabase
      .from('CONTROLE_COMPUTADORES')
      .select('*, aluno:ALUNOS(*)')
      .is('fim_uso', null);

    if (sessErr) throw sessErr;

    // Buscar problemas pendentes
    const { data: problemas, error: probErr } = await supabase
      .from('PROBLEMAS_COMPUTADORES')
      .select('*')
      .eq('status', 'pendente');

    if (probErr) throw probErr;

    // Formatar como o frontend espera
    const formatados = (computadores || []).map((pc: any) => {
      const pcSessoes = (sessoesAtivas || []).filter((s: any) => s.computador_id === pc.id);
      const pcProblemas = (problemas || []).filter((p: any) => p.computador_id === pc.id);

      return {
        ...pc,
        sessoesComputadores: pcSessoes,
        problemas: pcProblemas
      };
    });

    return NextResponse.json(formatados);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar computadores' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data: comp, error } = await supabase
      .from('COMPUTADORES')
      .insert([{
        nome_host: body.nome_host,
        patrimonio: body.patrimonio,
        status: body.status || 'disponivel',
        especificacoes: body.especificacoes || '',
        cadastrado_por: body.cadastrado_por || undefined
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(comp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar computador' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { data: comp, error } = await supabase
      .from('COMPUTADORES')
      .update({
        nome_host: body.nome_host,
        patrimonio: body.patrimonio,
        status: body.status,
        especificacoes: body.especificacoes
      })
      .eq('id', Number(body.id))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(comp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar computador' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await supabase
      .from('COMPUTADORES')
      .delete()
      .eq('id', Number(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao remover computador' }, { status: 400 });
  }
}
