import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const problemas = await prisma.problemaComputador.findMany({
      orderBy: { data_registro: 'desc' },
      include: {
        computador: true,
        responsavel: true
      }
    });
    return NextResponse.json(problemas);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar problemas' }, { status: 500 });
  }
}

// Registrar nova ocorrência
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { computador_id, descricao, registrado_por } = body;

    const novo = await prisma.problemaComputador.create({
      data: {
        computador_id: Number(computador_id),
        descricao,
        registrado_por: registrado_por || 'usr-01',
        status: 'pendente'
      }
    });

    // Atualiza computador para manutenção
    await prisma.computador.update({
      where: { id: Number(computador_id) },
      data: { status: 'manutencao' }
    });

    // Encerra sessão ativa do computador se houver
    const sessaoAtiva = await prisma.controleComputadores.findFirst({
      where: { computador_id: Number(computador_id), fim_uso: null }
    });

    if (sessaoAtiva) {
      await prisma.controleComputadores.update({
        where: { id: sessaoAtiva.id },
        data: { fim_uso: new Date() }
      });
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

    const atualizado = await prisma.problemaComputador.update({
      where: { id },
      data: {
        status: 'resolvido',
        data_resolucao: new Date()
      }
    });

    // Se não houver outros problemas pendentes, volta status do PC para disponível
    const pendentesRestantes = await prisma.problemaComputador.findMany({
      where: {
        computador_id: atualizado.computador_id,
        status: 'pendente'
      }
    });

    if (pendentesRestantes.length === 0) {
      await prisma.computador.update({
        where: { id: atualizado.computador_id },
        data: { status: 'disponivel' }
      });
    }

    return NextResponse.json(atualizado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao resolver ocorrência' }, { status: 400 });
  }
}
