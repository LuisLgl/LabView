import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: acessos, error } = await supabase
      .from('CONTROLE_SALA')
      .select('*, aluno:ALUNOS(*)')
      .order('entrada', { ascending: false });

    if (error) throw error;
    return NextResponse.json(acessos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar acessos' }, { status: 500 });
  }
}

// Check-in (Entrada) ou Check-out (Saída)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aluno_id } = body;

    if (!aluno_id) {
      return NextResponse.json({ error: 'Matrícula é obrigatória' }, { status: 400 });
    }

    const { data: aluno, error: alunoErr } = await supabase
      .from('ALUNOS')
      .select('*')
      .eq('id', aluno_id)
      .maybeSingle();

    if (alunoErr) throw alunoErr;
    if (!aluno) {
      return NextResponse.json({ error: `Matrícula ${aluno_id} não cadastrada` }, { status: 404 });
    }

    if (aluno.status === 'suspenso') {
      return NextResponse.json({ error: `O aluno ${aluno.nome} está com matrícula SUSPENSA` }, { status: 403 });
    }

    // Verifica se já está na sala sem saída
    const { data: acessoAberto, error: acessoErr } = await supabase
      .from('CONTROLE_SALA')
      .select('*')
      .eq('aluno_id', aluno_id)
      .is('saida', null)
      .maybeSingle();

    if (acessoErr) throw acessoErr;

    if (acessoAberto) {
      // REGISTRAR SAÍDA
      const { data: atualizado, error: updateErr } = await supabase
        .from('CONTROLE_SALA')
        .update({ saida: new Date().toISOString() })
        .eq('id', acessoAberto.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Se estiver em algum PC, encerra a sessão
      const { data: sessaoPC } = await supabase
        .from('CONTROLE_COMPUTADORES')
        .select('*')
        .eq('aluno_id', aluno_id)
        .is('fim_uso', null)
        .maybeSingle();

      if (sessaoPC) {
        await supabase
          .from('CONTROLE_COMPUTADORES')
          .update({ fim_uso: new Date().toISOString() })
          .eq('id', sessaoPC.id);

        await supabase
          .from('COMPUTADORES')
          .update({ status: 'disponivel' })
          .eq('id', sessaoPC.computador_id);
      }

      return NextResponse.json({ action: 'checkout', acesso: atualizado, aluno });
    } else {
      // REGISTRAR ENTRADA
      const { data: novo, error: insertErr } = await supabase
        .from('CONTROLE_SALA')
        .insert([{
          aluno_id,
          entrada: new Date().toISOString(),
          saida: null
        }])
        .select()
        .single();

      if (insertErr) throw insertErr;
      return NextResponse.json({ action: 'checkin', acesso: novo, aluno });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar acesso' }, { status: 400 });
  }
}
