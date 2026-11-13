
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [totalUsuarios, totalAlunos] = await Promise.all([
      prisma.usuario.count(),
      prisma.aluno.count(),
    ]);

    return NextResponse.json({
      sucesso: true,
      mensagem: "Conexão com SQLite e Prisma funcionando!",
      banco: "SQLite",
      tabelas: {
        usuarios: totalUsuarios,
        alunos: totalAlunos,
      },
    });
  } catch (error) {
    console.error("Erro ao testar conexão com o banco:", error);

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Não foi possível consultar o banco de dados.",
      },
      { status: 500 }
    );
  }
}
