import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_SESSAO,
  verificarTokenSessao,
} from "@/lib/auth";

export const runtime = "nodejs";

// VERIFICAR SE É ADMINISTRADOR OU MONITOR AUTENTICADO
async function verificarAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESSAO)?.value;

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

// LISTAR ALUNOS
export async function GET(req: NextRequest) {
  try {
    const administrador = await verificarAdmin(req);

    if (!administrador) {
      return NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const alunos = await prisma.aluno.findMany({
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        nome: true,
        email: true,
        curso: true,
        status: true,
        cadastradoPor: true,
        criadoEm: true,
      },
    });

    const resultado = alunos.map((aluno) => ({
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      curso: aluno.curso,
      status: aluno.status,
      cadastrado_por: aluno.cadastradoPor,
      criado_em: aluno.criadoEm,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);

    return NextResponse.json(
      { erro: "Erro ao buscar alunos." },
      { status: 500 }
    );
  }
}

// CADASTRAR ALUNO
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = String(body.id || "").trim();
    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const senha = String(body.senha || "");
    const curso = String(
      body.curso || "Sistemas de Informação"
    ).trim();

    if (!id || !nome || !email || !senha) {
      return NextResponse.json(
        { erro: "Preencha matrícula, nome, e-mail e senha." },
        { status: 400 }
      );
    }

    if (senha.length < 8) {
      return NextResponse.json(
        { erro: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    const senhaHash = await hash(senha, 12);

    const aluno = await prisma.aluno.create({
      data: {
        id,
        nome,
        email,
        senhaHash,
        curso,
        status: "ativo",
        cadastradoPor: null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        curso: true,
        status: true,
        cadastradoPor: true,
        criadoEm: true,
      },
    });

    return NextResponse.json(
      {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        curso: aluno.curso,
        status: aluno.status,
        cadastrado_por: aluno.cadastradoPor,
        criado_em: aluno.criadoEm,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erro ao cadastrar aluno:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { erro: "Matrícula ou e-mail já cadastrados." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { erro: "Não foi possível cadastrar o aluno." },
      { status: 400 }
    );
  }
}

// ATUALIZAR ALUNO
export async function PUT(req: NextRequest) {
  try {
    const administrador = await verificarAdmin(req);

    if (!administrador) {
      return NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { erro: "Matrícula obrigatória." },
        { status: 400 }
      );
    }

    if (
      body.status !== undefined &&
      !["ativo", "suspenso"].includes(body.status)
    ) {
      return NextResponse.json(
        { erro: "Status inválido." },
        { status: 400 }
      );
    }

    const aluno = await prisma.aluno.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && {
          nome: String(body.nome).trim(),
        }),
        ...(body.email !== undefined && {
          email: String(body.email).trim().toLowerCase(),
        }),
        ...(body.curso !== undefined && {
          curso: String(body.curso).trim(),
        }),
        ...(body.status !== undefined && {
          status: body.status,
        }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        curso: true,
        status: true,
        cadastradoPor: true,
        criadoEm: true,
      },
    });

    return NextResponse.json({
      id: aluno.id,
      nome: aluno.nome,
      email: aluno.email,
      curso: aluno.curso,
      status: aluno.status,
      cadastrado_por: aluno.cadastradoPor,
      criado_em: aluno.criadoEm,
    });
  } catch (error: unknown) {
    console.error("Erro ao atualizar aluno:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { erro: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { erro: "Não foi possível atualizar o aluno." },
      { status: 400 }
    );
  }
}

// SUSPENDER ALUNO (PRESERVA O HISTÓRICO)
export async function DELETE(req: NextRequest) {
  try {
    const administrador = await verificarAdmin(req);

    if (!administrador) {
      return NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { erro: "Matrícula obrigatória." },
        { status: 400 }
      );
    }

    await prisma.aluno.update({
      where: { id },
      data: { status: "suspenso" },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Aluno suspenso com sucesso.",
    });
  } catch (error: unknown) {
    console.error("Erro ao suspender aluno:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { erro: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { erro: "Não foi possível suspender o aluno." },
      { status: 400 }
    );
  }
}