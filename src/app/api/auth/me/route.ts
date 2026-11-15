import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_SESSAO,
  verificarTokenSessao,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_SESSAO)?.value;

    if (!token) {
      return NextResponse.json(
        { autenticado: false },
        { status: 401 }
      );
    }

    const sessao = await verificarTokenSessao(token);

    if (!sessao || typeof sessao.id !== "string") {
      return NextResponse.json(
        { autenticado: false },
        { status: 401 }
      );
    }

    if (sessao.tipo === "admin") {
      const usuario = await prisma.usuario.findUnique({
        where: { id: sessao.id },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          statusAprovacao: true,
        },
      });

      if (!usuario || usuario.statusAprovacao === "pendente") {
        return NextResponse.json(
          { autenticado: false },
          { status: 401 }
        );
      }

      return NextResponse.json({
        autenticado: true,
        tipo: "admin",
        usuario,
      });
    }

    if (sessao.tipo === "aluno") {
      const aluno = await prisma.aluno.findUnique({
        where: { id: sessao.id },
        select: {
          id: true,
          nome: true,
          email: true,
          curso: true,
          status: true,
        },
      });

      if (!aluno || aluno.status !== "ativo") {
        return NextResponse.json(
          { autenticado: false },
          { status: 401 }
        );
      }

      return NextResponse.json({
        autenticado: true,
        tipo: "aluno",
        usuario: aluno,
      });
    }

    return NextResponse.json(
      { autenticado: false },
      { status: 401 }
    );
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);

    return NextResponse.json(
      { erro: "Não foi possível verificar a sessão." },
      { status: 500 }
    );
  }
}