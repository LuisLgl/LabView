import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESSAO, verificarTokenSessao } from "@/lib/auth";

export const runtime = "nodejs";

async function verificarAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSAO)?.value;

  if (!token) return null;

  const sessao = await verificarTokenSessao(token);

  if (
    !sessao ||
    sessao.tipo !== "admin" ||
    typeof sessao.id !== "string"
  ) {
    return null;
  }

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

  return usuario;
}

async function verificarSessao() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSAO)?.value;

  if (!token) return null;

  const sessao = await verificarTokenSessao(token);

  if (!sessao || typeof sessao.id !== "string") {
    return null;
  }

  if (sessao.tipo === "admin") {
    const usuario = await prisma.usuario.findUnique({
      where: { id: sessao.id },
    });

    if (!usuario || usuario.statusAprovacao === "pendente") {
      return null;
    }

    return sessao;
  }

  if (sessao.tipo === "aluno") {
    const aluno = await prisma.aluno.findUnique({
      where: { id: sessao.id },
    });

    if (!aluno || aluno.status !== "ativo") {
      return null;
    }

    return sessao;
  }

  return null;
}

// LISTAR COMPUTADORES
export async function GET() {
  try {
    const sessao = await verificarSessao();

    if (!sessao) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const computadores = await prisma.computador.findMany({
      orderBy: { id: "asc" },
      include: {
        controles: {
          where: { fimUso: null },
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
          },
        },
        problemas: {
          where: { status: "pendente" },
        },
      },
    });

    const formatados = computadores.map((pc) => ({
      id: pc.id,
      nome_host: pc.nomeHost,
      patrimonio: pc.patrimonio,
      status: pc.status,
      especificacoes: pc.especificacoes,
      cadastrado_por: pc.cadastradoPor,

      sessoesComputadores: pc.controles.map((sessao) => ({
        id: sessao.id,
        aluno_id: sessao.alunoId,
        computador_id: sessao.computadorId,
        inicio_uso: sessao.inicioUso,
        fim_uso: sessao.fimUso,
        aluno: sessao.aluno,
      })),

      problemas: pc.problemas.map((problema) => ({
        id: problema.id,
        computador_id: problema.computadorId,
        categoria: problema.categoria,
        descricao: problema.descricao,
        data_registro: problema.dataRegistro,
        data_resolucao: problema.dataResolucao,
        status: problema.status,
        registrado_por: problema.registradoPor,
      })),
    }));

    return NextResponse.json(formatados);
  } catch (error) {
    console.error("Erro ao buscar computadores:", error);

    return NextResponse.json(
      { error: "Erro ao buscar computadores." },
      { status: 500 }
    );
  }
}

// CADASTRAR COMPUTADOR
export async function POST(req: Request) {
  try {
    const usuario = await verificarAdmin();

    if (!usuario) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const nomeHost = String(body.nome_host ?? "").trim();
    const patrimonio = String(body.patrimonio ?? "").trim();
    const especificacoes = String(body.especificacoes ?? "").trim();
    const status = body.status ?? "disponivel";

    if (!nomeHost || !patrimonio) {
      return NextResponse.json(
        { error: "Nome do computador e patrimônio são obrigatórios." },
        { status: 400 }
      );
    }

    if (!["disponivel", "ocupado", "manutencao"].includes(status)) {
      return NextResponse.json(
        { error: "Status do computador inválido." },
        { status: 400 }
      );
    }

    const computador = await prisma.computador.create({
      data: {
        nomeHost,
        patrimonio,
        status,
        especificacoes,
        cadastradoPor: usuario.id,
      },
    });

    return NextResponse.json({
      id: computador.id,
      nome_host: computador.nomeHost,
      patrimonio: computador.patrimonio,
      status: computador.status,
      especificacoes: computador.especificacoes,
      cadastrado_por: computador.cadastradoPor,
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar computador:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um computador com esse patrimônio." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao cadastrar computador." },
      { status: 500 }
    );
  }
}

// ATUALIZAR COMPUTADOR
export async function PUT(req: Request) {
  try {
    const usuario = await verificarAdmin();

    if (!usuario) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID do computador inválido." },
        { status: 400 }
      );
    }

    const dados: {
      nomeHost?: string;
      patrimonio?: string;
      status?: string;
      especificacoes?: string;
    } = {};

    if (body.nome_host !== undefined) {
      dados.nomeHost = String(body.nome_host).trim();
    }

    if (body.patrimonio !== undefined) {
      dados.patrimonio = String(body.patrimonio).trim();
    }

    if (body.status !== undefined) {
      if (!["disponivel", "ocupado", "manutencao"].includes(body.status)) {
        return NextResponse.json(
          { error: "Status do computador inválido." },
          { status: 400 }
        );
      }

      dados.status = body.status;
    }

    if (body.especificacoes !== undefined) {
      dados.especificacoes = String(body.especificacoes).trim();
    }

    const computador = await prisma.computador.update({
      where: { id },
      data: dados,
    });

    return NextResponse.json({
      id: computador.id,
      nome_host: computador.nomeHost,
      patrimonio: computador.patrimonio,
      status: computador.status,
      especificacoes: computador.especificacoes,
      cadastrado_por: computador.cadastradoPor,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar computador:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Computador não encontrado." },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um computador com esse patrimônio." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar computador." },
      { status: 500 }
    );
  }
}

// REMOVER COMPUTADOR
export async function DELETE(req: Request) {
  try {
    const usuario = await verificarAdmin();

    if (!usuario) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID do computador inválido." },
        { status: 400 }
      );
    }

    const computador = await prisma.computador.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            controles: true,
            problemas: true,
          },
        },
      },
    });

    if (!computador) {
      return NextResponse.json(
        { error: "Computador não encontrado." },
        { status: 404 }
      );
    }

    if (
      computador._count.controles > 0 ||
      computador._count.problemas > 0
    ) {
      return NextResponse.json(
        {
          error:
            "Não é possível remover este computador porque existem registros de uso ou problemas vinculados a ele.",
        },
        { status: 409 }
      );
    }

    await prisma.computador.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover computador:", error);

    return NextResponse.json(
      { error: "Erro ao remover computador." },
      { status: 500 }
    );
  }
}