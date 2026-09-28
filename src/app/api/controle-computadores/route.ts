import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessoes = await prisma.controleComputadores.findMany({
      orderBy: { inicio_uso: 'desc' },
      include: {
        aluno: true,
        computador: true
      }
    });
    return NextResponse.json(sessoes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar sessões' }, { status: 500 });
  }
}

// Iniciar uso de computador
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aluno_id, computador_id } = body;

    const pc = await prisma.computador.findUnique({
      where: { id: Number(computador_id) }
    });

    if (!pc) return NextResponse.json({ error: 'Computador não encontrado' }, { status: 404 });
    if (pc.status === 'ocupado') return NextResponse.json({ error: `O computador ${pc.nome_host} já está ocupado` }, { status: 400 });
    if (pc.status === 'manutencao') return NextResponse.json({ error: `O computador ${pc.nome_host} está em manutenção` }, { status: 400 });

    const aluno = await prisma.aluno.findUnique({
      where: { id: aluno_id }
    });
    if (!aluno) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });

    // Garante que o aluno tenha registro de entrada na sala
    const presente = await prisma.controleSala.findFirst({
      where: { aluno_id, saida: null }
    });

    if (!presente) {
      await prisma.controleSala.create({
        data: { aluno_id, entrada: new Date(), saida: null }
      });
    }

    // Se o aluno já estiver em outro PC, encerra a sessão anterior
    const sessaoAnterior = await prisma.controleComputadores.findFirst({
      where: { aluno_id, fim_uso: null }
    });

    if (sessaoAnterior) {
      await prisma.controleComputadores.update({
        where: { id: sessaoAnterior.id },
        data: { fim_uso: new Date() }
      });
      await prisma.computador.update({
        where: { id: sessaoAnterior.computador_id },
        data: { status: 'disponivel' }
      });
    }

    // Inicia nova sessão
    const novaSessao = await prisma.controleComputadores.create({
      data: {
        aluno_id,
        computador_id: Number(computador_id),
        inicio_uso: new Date(),
        fim_uso: null
      },
      include: { aluno: true, computador: true }
    });

    // Atualiza status do computador para ocupado
    await prisma.computador.update({
      where: { id: Number(computador_id) },
      data: { status: 'ocupado' }
    });

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

    const sessaoAtiva = await prisma.controleComputadores.findFirst({
      where: { computador_id: Number(computador_id), fim_uso: null }
    });

    if (sessaoAtiva) {
      await prisma.controleComputadores.update({
        where: { id: sessaoAtiva.id },
        data: { fim_uso: new Date() }
      });
    }

    const pc = await prisma.computador.update({
      where: { id: Number(computador_id) },
      data: { status: 'disponivel' }
    });

    return NextResponse.json({ success: true, computador: pc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao liberar computador' }, { status: 400 });
  }
}
