import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const computadores = await prisma.computador.findMany({
      orderBy: { id: 'asc' },
      include: {
        sessoesComputadores: {
          where: { fim_uso: null },
          include: { aluno: true }
        },
        problemas: {
          where: { status: 'pendente' }
        }
      }
    });
    return NextResponse.json(computadores);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar computadores' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const comp = await prisma.computador.create({
      data: {
        nome_host: body.nome_host,
        patrimonio: body.patrimonio,
        status: body.status || 'disponivel',
        especificacoes: body.especificacoes || '',
        cadastrado_por: body.cadastrado_por || 'usr-01'
      }
    });
    return NextResponse.json(comp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar computador' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const comp = await prisma.computador.update({
      where: { id: Number(body.id) },
      data: {
        nome_host: body.nome_host,
        patrimonio: body.patrimonio,
        status: body.status,
        especificacoes: body.especificacoes
      }
    });
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
    await prisma.computador.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao remover computador' }, { status: 400 });
  }
}
