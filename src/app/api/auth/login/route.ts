import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  criarTokenSessao,
  COOKIE_SESSAO,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tipo = body.tipo;
    const identificador = String(body.identificador || "").trim();
    const senha = String(body.senha || "");

    if (
      !["admin", "aluno"].includes(tipo) ||
      !identificador ||
      !senha
    ) {
      return NextResponse.json(
        { erro: "Informe o tipo de acesso, identificação e senha." },
        { status: 400 }
      );
    }

    let usuarioAutenticado:
      | {
          id: string;
          nome: string;
          email?: string;
          perfil?: string;
          tipo: "admin" | "aluno";
        }
      | null = null;

    if (tipo === "admin") {
      const usuario = await prisma.usuario.findUnique({
        where: { email: identificador.toLowerCase() },
      });

      if (!usuario || usuario.statusAprovacao === "pendente") {
        return NextResponse.json(
          { erro: "E-mail ou senha inválidos." },
          { status: 401 }
        );
      }

      const senhaValida = await compare(senha, usuario.senhaHash);

      if (!senhaValida) {
        return NextResponse.json(
          { erro: "E-mail ou senha inválidos." },
          { status: 401 }
        );
      }

      usuarioAutenticado = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        tipo: "admin",
      };
    } else {
      const aluno = await prisma.aluno.findUnique({
        where: { id: identificador },
      });

      if (!aluno || aluno.status !== "ativo") {
        return NextResponse.json(
          { erro: "Matrícula ou senha inválidas." },
          { status: 401 }
        );
      }

      const senhaValida = await compare(senha, aluno.senhaHash);

      if (!senhaValida) {
        return NextResponse.json(
          { erro: "Matrícula ou senha inválidas." },
          { status: 401 }
        );
      }

      usuarioAutenticado = {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        tipo: "aluno",
      };
    }

    const token = await criarTokenSessao({
      id: usuarioAutenticado.id,
      tipo: usuarioAutenticado.tipo,
      perfil: usuarioAutenticado.perfil,
    });

    const response = NextResponse.json({
      sucesso: true,
      usuario: usuarioAutenticado,
    });

    response.cookies.set(COOKIE_SESSAO, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);

    return NextResponse.json(
      { erro: "Não foi possível realizar o login." },
      { status: 500 }
    );
  }
}