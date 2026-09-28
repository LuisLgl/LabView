import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const acessos = await prisma.controleSala.findMany({
      orderBy: { entrada: 'desc' },
      include: { aluno: true }
    });
    return NextResponse.json(acessos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar acessos' }, { status: 500 });
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

    const aluno = await prisma.aluno.findUnique({
      where: { id: aluno_id }
    });

    if (!aluno) {
      return NextResponse.json({ error: `Matrícula ${aluno_id} não cadastrada` }, { status: 404 });
    }

    if (aluno.status === 'suspenso') {
      return NextResponse.json({ error: `O aluno ${aluno.nome} está com matrícula SUSPENSA` }, { status: 403 });
    }

    // Verifica se já está na sala sem saída
    const acessoAberto = await prisma.controleSala.findFirst({
      where: {
        aluno_id,
        saida: null
      }
    });

    if (acessoAberto) {
      // REGISTRAR SAÍDA
      const atualizado = await prisma.controleSala.update({
        where: { id: acessoAberto.id },
        data: { saida: new Date() }
      });

      // Se estiver em algum PC, encerra a sessão
      const sessaoPC = await prisma.controleComputadores.findFirst({
        where: { aluno_id, fim_uso: null }
      });

      if (sessaoPC) {
        await prisma.controleComputadores.update({
          where: { id: sessaoPC.id },
          data: { fim_uso: new Date() }
        });
        await prisma.computador.update({
          where: { id: sessaoPC.computador_id },
          data: { status: 'disponivel' }
        });
      }

      return NextResponse.json({ action: 'checkout', acesso: atualizado, aluno });
    } else {
      // REGISTRAR ENTRADA
      const novo = await prisma.controleSala.create({
        data: {
          aluno_id,
          entrada: new Date(),
          saida: null
        }
      });
      return NextResponse.json({ action: 'checkin', acesso: novo, aluno });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar acesso' }, { status: 400 });
  }
}
