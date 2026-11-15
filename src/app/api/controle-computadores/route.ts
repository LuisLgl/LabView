
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_SESSAO,
  verificarTokenSessao,
} from "@/lib/auth";

export const runtime = "nodejs";

async function obterSessao() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSAO)?.value;

  if (!token) return null;

  const sessao = await verificarTokenSessao(token);

  if (
    !sessao ||
    typeof sessao.id !== "string" ||
    (sessao.tipo !== "admin" && sessao.tipo !== "aluno")
  ) {
    return null;
  }

  if (sessao.tipo === "admin") {
    const usuario = await prisma.usuario.findUnique({
      where: { id: sessao.id },
      select: {
        id: true,
        statusAprovacao: true,
      },
    });

    if (!usuario || usuario.statusAprovacao === "pendente") {
      return null;
    }

    return { id: usuario.id, tipo: "admin" as const };
  }

  const aluno = await prisma.aluno.findUnique({
    where: { id: sessao.id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!aluno || aluno.status !== "ativo") {
    return null;
  }

  return { id: aluno.id, tipo: "aluno" as const };
}

async function verificarAdmin() {
  const sessao = await obterSessao();

  return sessao?.tipo === "admin" ? sessao : null;
}

// LISTAR SESSÕES
export async function GET() {
  try {
    const admin = await verificarAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const sessoes = await prisma.controleComputadores.findMany({
      orderBy: {
        inicioUso: "desc",
      },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
            curso: true,
            status: true,
          },
        },
        computador: true,
      },
    });

    const formatadas = sessoes.map((sessao) => ({
      id: sessao.id,
      aluno_id: sessao.alunoId,
      computador_id: sessao.computadorId,
      inicio_uso: sessao.inicioUso,
      fim_uso: sessao.fimUso,
      aluno: sessao.aluno,
      computador: {
        id: sessao.computador.id,
        nome_host: sessao.computador.nomeHost,
        patrimonio: sessao.computador.patrimonio,
        status: sessao.computador.status,
        especificacoes: sessao.computador.especificacoes,
      },
    }));

    return NextResponse.json(formatadas);
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);

    return NextResponse.json(
      { error: "Erro ao buscar sessões." },
      { status: 500 }
    );
  }
}

// INICIAR USO DE COMPUTADOR
export async function POST(req: Request) {
  try {
    const sessao = await obterSessao();

    if (!sessao) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const computadorId = Number(body.computador_id);

    if (!Number.isInteger(computadorId) || computadorId <= 0) {
      return NextResponse.json(
        { error: "ID do computador inválido." },
        { status: 400 }
      );
    }

    // O aluno só pode iniciar uma sessão para sua própria matrícula.
    const alunoId =
      sessao.tipo === "aluno"
        ? sessao.id
        : String(body.aluno_id ?? "").trim();

    if (!alunoId) {
      return NextResponse.json(
        { error: "Matrícula do aluno é obrigatória." },
        { status: 400 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const aluno = await tx.aluno.findUnique({
        where: { id: alunoId },
        select: {
          id: true,
          nome: true,
          email: true,
          curso: true,
          status: true,
        },
      });

      if (!aluno) {
        throw new Error("ALUNO_NAO_ENCONTRADO");
      }

      if (aluno.status !== "ativo") {
        throw new Error("ALUNO_SUSPENSO");
      }

      const computador = await tx.computador.findUnique({
        where: { id: computadorId },
      });

      if (!computador) {
        throw new Error("COMPUTADOR_NAO_ENCONTRADO");
      }

      const sessaoAnterior = await tx.controleComputadores.findFirst({
        where: {
          alunoId,
          fimUso: null,
        },
        orderBy: {
          inicioUso: "desc",
        },
      });

      // Se já estiver usando este computador, retorna a sessão atual.
      if (
        sessaoAnterior &&
        sessaoAnterior.computadorId === computadorId
      ) {
        const atual = await tx.controleComputadores.findUnique({
          where: { id: sessaoAnterior.id },
          include: {
            aluno: {
              select: {
                id: true,
                nome: true,
                email: true,
                curso: true,
                status: true,
              },
            },
            computador: true,
          },
        });

        return atual;
      }

      if (computador.status === "ocupado") {
        throw new Error("COMPUTADOR_OCUPADO");
      }

      if (computador.status === "manutencao") {
        throw new Error("COMPUTADOR_MANUTENCAO");
      }

      const agora = new Date();

      // Garante que o aluno tenha entrada registrada na sala.
      const acessoAberto = await tx.controleSala.findFirst({
        where: {
          alunoId,
          saida: null,
        },
      });

      if (!acessoAberto) {
        await tx.controleSala.create({
          data: {
            alunoId,
            entrada: agora,
          },
        });
      }

      // Encerra o uso do computador anterior, se existir.
      if (sessaoAnterior) {
        await tx.controleComputadores.update({
          where: { id: sessaoAnterior.id },
          data: { fimUso: agora },
        });

        const outrasSessoes = await tx.controleComputadores.count({
          where: {
            computadorId: sessaoAnterior.computadorId,
            fimUso: null,
          },
        });

        const problemasPendentes = await tx.problemaComputador.count({
          where: {
            computadorId: sessaoAnterior.computadorId,
            status: "pendente",
          },
        });

        if (outrasSessoes === 0 && problemasPendentes === 0) {
          await tx.computador.update({
            where: { id: sessaoAnterior.computadorId },
            data: { status: "disponivel" },
          });
        }
      }

      // Cria a nova sessão.
      const novaSessao = await tx.controleComputadores.create({
        data: {
          alunoId,
          computadorId,
          inicioUso: agora,
        },
      });

      await tx.computador.update({
        where: { id: computadorId },
        data: { status: "ocupado" },
      });

      return tx.controleComputadores.findUnique({
        where: { id: novaSessao.id },
        include: {
          aluno: {
            select: {
              id: true,
              nome: true,
              email: true,
              curso: true,
              status: true,
            },
          },
          computador: true,
        },
      });
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error("Erro ao iniciar uso:", error);

    const erros: Record<string, { mensagem: string; status: number }> = {
      ALUNO_NAO_ENCONTRADO: {
        mensagem: "Aluno não encontrado.",
        status: 404,
      },
      ALUNO_SUSPENSO: {
        mensagem: "O aluno está com matrícula suspensa.",
        status: 403,
      },
      COMPUTADOR_NAO_ENCONTRADO: {
        mensagem: "Computador não encontrado.",
        status: 404,
      },
      COMPUTADOR_OCUPADO: {
        mensagem: "Este computador já está ocupado.",
        status: 409,
      },
      COMPUTADOR_MANUTENCAO: {
        mensagem: "Este computador está em manutenção.",
        status: 409,
      },
    };

    const erro = erros[error.message];

    return NextResponse.json(
      {
        error: erro?.mensagem ?? "Erro ao iniciar uso do computador.",
      },
      { status: erro?.status ?? 500 }
    );
  }
}

// ENCERRAR USO DE COMPUTADOR
export async function PUT(req: Request) {
  try {
    const sessao = await obterSessao();

    if (!sessao) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const computadorId = Number(body.computador_id);

    if (!Number.isInteger(computadorId) || computadorId <= 0) {
      return NextResponse.json(
        { error: "ID do computador inválido." },
        { status: 400 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const computador = await tx.computador.findUnique({
        where: { id: computadorId },
      });

      if (!computador) {
        throw new Error("COMPUTADOR_NAO_ENCONTRADO");
      }

      const sessaoAtiva = await tx.controleComputadores.findFirst({
        where: {
          computadorId,
          fimUso: null,
        },
        orderBy: {
          inicioUso: "desc",
        },
      });

      // Aluno só pode encerrar a própria sessão.
      if (
        sessao.tipo === "aluno" &&
        (!sessaoAtiva || sessaoAtiva.alunoId !== sessao.id)
      ) {
        throw new Error("SESSAO_NAO_AUTORIZADA");
      }

      if (sessaoAtiva) {
        await tx.controleComputadores.update({
          where: { id: sessaoAtiva.id },
          data: { fimUso: new Date() },
        });
      }

      const outrasSessoes = await tx.controleComputadores.count({
        where: {
          computadorId,
          fimUso: null,
        },
      });

      const problemasPendentes = await tx.problemaComputador.count({
        where: {
          computadorId,
          status: "pendente",
        },
      });

      const novoStatus =
        problemasPendentes > 0
          ? "manutencao"
          : outrasSessoes > 0
            ? "ocupado"
            : "disponivel";

      const atualizado = await tx.computador.update({
        where: { id: computadorId },
        data: { status: novoStatus },
      });

      return atualizado;
    });

    return NextResponse.json({
      success: true,
      computador: {
        id: resultado.id,
        nome_host: resultado.nomeHost,
        patrimonio: resultado.patrimonio,
        status: resultado.status,
        especificacoes: resultado.especificacoes,
      },
    });
  } catch (error: any) {
    console.error("Erro ao liberar computador:", error);

    if (error.message === "COMPUTADOR_NAO_ENCONTRADO") {
      return NextResponse.json(
        { error: "Computador não encontrado." },
        { status: 404 }
      );
    }

    if (error.message === "SESSAO_NAO_AUTORIZADA") {
      return NextResponse.json(
        { error: "Você não tem autorização para encerrar esta sessão." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao liberar computador." },
      { status: 500 }
    );
  }
}
