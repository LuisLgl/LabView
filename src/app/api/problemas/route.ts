
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

// LISTAR OCORRÊNCIAS
export async function GET() {
  try {
    const sessao = await obterSessao();

    if (!sessao) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const problemas = await prisma.problemaComputador.findMany({
      where:
        sessao.tipo === "aluno"
          ? { registradoPorAlunoId: sessao.id }
          : undefined,
      orderBy: {
        dataRegistro: "desc",
      },
      include: {
        computador: {
          select: {
            id: true,
            nomeHost: true,
            patrimonio: true,
            status: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
            curso: true,
          },
        },
      },
    });

    const formatados = problemas.map((problema) => ({
      id: problema.id,
      computador_id: problema.computadorId,
      categoria: problema.categoria,
      descricao: problema.descricao,
      data_registro: problema.dataRegistro,
      data_resolucao: problema.dataResolucao,
      status: problema.status,
      registrado_por: problema.registradoPor,
      computador: problema.computador
        ? {
            id: problema.computador.id,
            nome_host: problema.computador.nomeHost,
            patrimonio: problema.computador.patrimonio,
            status: problema.computador.status,
          }
        : null,
      responsavel: problema.usuario,
      aluno: problema.aluno,
    }));

    return NextResponse.json(formatados);
  } catch (error) {
    console.error("Erro ao buscar problemas:", error);

    return NextResponse.json(
      { error: "Erro ao buscar problemas." },
      { status: 500 }
    );
  }
}

// REGISTRAR NOVA OCORRÊNCIA
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

    const descricao = String(body.descricao ?? "").trim();
    const categoria = body.categoria
      ? String(body.categoria).trim()
      : null;

    const computadorId =
      body.computador_id === null ||
      body.computador_id === undefined ||
      body.computador_id === ""
        ? null
        : Number(body.computador_id);

    if (!descricao) {
      return NextResponse.json(
        { error: "A descrição do problema é obrigatória." },
        { status: 400 }
      );
    }

    if (
      computadorId !== null &&
      (!Number.isInteger(computadorId) || computadorId <= 0)
    ) {
      return NextResponse.json(
        { error: "ID do computador inválido." },
        { status: 400 }
      );
    }

    const novo = await prisma.$transaction(async (tx) => {
      // Verifica se o computador existe, quando informado.
      if (computadorId !== null) {
        const computador = await tx.computador.findUnique({
          where: { id: computadorId },
        });

        if (!computador) {
          throw new Error("COMPUTADOR_NAO_ENCONTRADO");
        }
      }

      const problema = await tx.problemaComputador.create({
        data: {
          computadorId,
          categoria,
          descricao,
          status: "pendente",
          registradoPor: sessao.id,
          registradoPorUsuarioId:
            sessao.tipo === "admin" ? sessao.id : null,
          registradoPorAlunoId:
            sessao.tipo === "aluno" ? sessao.id : null,
        },
      });

      if (computadorId !== null) {
        // Coloca o computador em manutenção.
        await tx.computador.update({
          where: { id: computadorId },
          data: { status: "manutencao" },
        });

        // Encerra todas as sessões ativas desse computador.
        await tx.controleComputadores.updateMany({
          where: {
            computadorId,
            fimUso: null,
          },
          data: {
            fimUso: new Date(),
          },
        });
      }

      return tx.problemaComputador.findUnique({
        where: { id: problema.id },
        include: {
          computador: {
            select: {
              id: true,
              nomeHost: true,
              patrimonio: true,
              status: true,
            },
          },
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          aluno: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
      });
    });

    return NextResponse.json(novo, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao registrar ocorrência:", error);

    if (error.message === "COMPUTADOR_NAO_ENCONTRADO") {
      return NextResponse.json(
        { error: "Computador não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao registrar ocorrência." },
      { status: 500 }
    );
  }
}

// RESOLVER OCORRÊNCIA
export async function PUT(req: Request) {
  try {
    const admin = await verificarAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const id = String(body.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "ID da ocorrência é obrigatório." },
        { status: 400 }
      );
    }

    const atualizado = await prisma.$transaction(async (tx) => {
      const problema = await tx.problemaComputador.findUnique({
        where: { id },
      });

      if (!problema) {
        throw new Error("PROBLEMA_NAO_ENCONTRADO");
      }

      if (problema.status === "resolvido") {
        throw new Error("PROBLEMA_JA_RESOLVIDO");
      }

      const resolvido = await tx.problemaComputador.update({
        where: { id },
        data: {
          status: "resolvido",
          dataResolucao: new Date(),
        },
      });

      // Atualiza o computador, se a ocorrência estiver vinculada a um.
      if (problema.computadorId !== null) {
        const problemasPendentes =
          await tx.problemaComputador.count({
            where: {
              computadorId: problema.computadorId,
              status: "pendente",
            },
          });

        const sessoesAtivas =
          await tx.controleComputadores.count({
            where: {
              computadorId: problema.computadorId,
              fimUso: null,
            },
          });

        const novoStatus =
          problemasPendentes > 0
            ? "manutencao"
            : sessoesAtivas > 0
              ? "ocupado"
              : "disponivel";

        await tx.computador.update({
          where: { id: problema.computadorId },
          data: { status: novoStatus },
        });
      }

      return resolvido;
    });

    return NextResponse.json(atualizado);
  } catch (error: any) {
    console.error("Erro ao resolver ocorrência:", error);

    if (error.message === "PROBLEMA_NAO_ENCONTRADO") {
      return NextResponse.json(
        { error: "Ocorrência não encontrada." },
        { status: 404 }
      );
    }

    if (error.message === "PROBLEMA_JA_RESOLVIDO") {
      return NextResponse.json(
        { error: "Esta ocorrência já foi resolvida." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao resolver ocorrência." },
      { status: 500 }
    );
  }
}
