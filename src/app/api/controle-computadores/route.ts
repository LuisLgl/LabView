import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: sessoes, error } = await supabase
      .from('CONTROLE_COMPUTADORES')
      .select('*, aluno:ALUNOS(*), computador:COMPUTADORES(*)')
      .order('inicio_uso', { ascending: false });

    if (error) throw error;
    return NextResponse.json(sessoes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar sessões' }, { status: 500 });
  }
}

// Iniciar uso de computador
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aluno_id, computador_id } = body;

    const { data: pc, error: pcErr } = await supabase
      .from('COMPUTADORES')
      .select('*')
      .eq('id', Number(computador_id))
      .maybeSingle();

    if (pcErr) throw pcErr;
    if (!pc) return NextResponse.json({ error: 'Computador não encontrado' }, { status: 404 });
    if (pc.status === 'ocupado') return NextResponse.json({ error: `O computador ${pc.nome_host} já está ocupado` }, { status: 400 });
    if (pc.status === 'manutencao') return NextResponse.json({ error: `O computador ${pc.nome_host} está em manutenção` }, { status: 400 });

    const { data: aluno, error: alunoErr } = await supabase
      .from('ALUNOS')
      .select('*')
      .eq('id', aluno_id)
      .maybeSingle();

    if (alunoErr) throw alunoErr;
    if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });

    // Garante que o aluno tenha registro de entrada na sala
    const { data: presente } = await supabase
      .from('CONTROLE_SALA')
      .select('*')
      .eq('aluno_id', aluno_id)
      .is('saida', null)
      .maybeSingle();

    if (!presente) {
      await supabase
        .from('CONTROLE_SALA')
        .insert([{ aluno_id, entrada: new Date().toISOString(), saida: null }]);
    }

    // Se o aluno já estiver em outro PC, encerra a sessão anterior
    const { data: sessaoAnterior } = await supabase
      .from('CONTROLE_COMPUTADORES')
      .select('*')
      .eq('aluno_id', aluno_id)
      .is('fim_uso', null)
      .maybeSingle();

    if (sessaoAnterior) {
      await supabase
        .from('CONTROLE_COMPUTADORES')
        .update({ fim_uso: new Date().toISOString() })
        .eq('id', sessaoAnterior.id);

      await supabase
        .from('COMPUTADORES')
        .update({ status: 'disponivel' })
        .eq('id', sessaoAnterior.computador_id);
    }

    // Inicia nova sessão
    const { data: novaSessao, error: sessaoErr } = await supabase
      .from('CONTROLE_COMPUTADORES')
      .insert([{
        aluno_id,
        computador_id: Number(computador_id),
        inicio_uso: new Date().toISOString(),
        fim_uso: null
      }])
      .select('*, aluno:ALUNOS(*), computador:COMPUTADORES(*)')
      .single();

    if (sessaoErr) throw sessaoErr;

    // Atualiza status do computador para ocupado
    await supabase
      .from('COMPUTADORES')
      .update({ status: 'ocupado' })
      .eq('id', Number(computador_id));

    return NextResponse.json(novaSessao);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao iniciar uso do computador' }, { status: 400 });
  }
}

// Encerrar uso / liberar computador
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { computador_id } = body;

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

    const { data: pc, error: pcErr } = await supabase
      .from('COMPUTADORES')
      .update({ status: 'disponivel' })
      .eq('id', Number(computador_id))
      .select()
      .single();

    if (pcErr) throw pcErr;

    return NextResponse.json({ success: true, computador: pc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao liberar computador' }, { status: 400 });
  }
}
