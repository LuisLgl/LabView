import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: alunos, error } = await supabase
      .from('ALUNOS')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return NextResponse.json(alunos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar alunos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data: aluno, error } = await supabase
      .from('ALUNOS')
      .insert([{
        id: body.id,
        nome: body.nome,
        email: body.email,
        curso: body.curso || 'Sistemas de Informação',
        status: body.status || 'ativo',
        cadastrado_por: body.cadastrado_por || undefined
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(aluno);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar aluno' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { data: aluno, error } = await supabase
      .from('ALUNOS')
      .update({
        nome: body.nome,
        email: body.email,
        curso: body.curso,
        status: body.status
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(aluno);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar aluno' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    const { error } = await supabase
      .from('ALUNOS')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao remover aluno' }, { status: 400 });
  }
}
