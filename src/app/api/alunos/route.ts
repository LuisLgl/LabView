import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alunos = await prisma.aluno.findMany({
      orderBy: { criado_em: 'desc' }
    });
    return NextResponse.json(alunos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar alunos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const aluno = await prisma.aluno.create({
      data: {
        id: body.id,
        nome: body.nome,
        email: body.email,
        curso: body.curso || 'Sistemas de Informação',
        status: body.status || 'ativo',
        cadastrado_por: body.cadastrado_por || 'usr-01'
      }
    });
    return NextResponse.json(aluno);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao cadastrar aluno' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const aluno = await prisma.aluno.update({
      where: { id: body.id },
      data: {
        nome: body.nome,
        email: body.email,
        curso: body.curso,
        status: body.status
      }
    });
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
    await prisma.aluno.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao remover aluno' }, { status: 400 });
  }
}
