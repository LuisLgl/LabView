import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_SESSAO,
  verificarTokenSessao,
} from "@/lib/auth";

export const runtime = "nodejs";

// LISTAR USUÁRIOS
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_SESSAO)?.value;

    if (!token) {
      return NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const sessao = await verificarTokenSessao(token);

    if (!sessao || sessao.tipo !== "admin" || typeof sessao.id !== "string") {
      return NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const administrador = await prisma.usuario.findUnique({
      where: { id: sessao.id },
      select: { id: true, statusAprovacao: true },
    });

    if (!administrador || administrador.statusAprovacao === "pendente") {
      return NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const usuarios = await prisma.usuario.findMany({
      orderBy: { criadoEm: "asc" },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        statusAprovacao: true,
        criadoEm: true,
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    return NextResponse.json(
      { erro: "Erro ao buscar usuários." },
      { status: 500 }
    );
  }
}

// CADASTRAR SOLICITAÇÃO DE USUÁRIO
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const senha = String(body.senha || "");

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { erro: "Preencha nome, e-mail e senha." },
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

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        perfil: "Monitor",
        statusAprovacao: "pendente",
        codigoConfirmacao: null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        statusAprovacao: true,
        criadoEm: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao cadastrar usuário:", error);

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
      { erro: "Não foi possível cadastrar o usuário." },
      { status: 400 }
    );
  }
}