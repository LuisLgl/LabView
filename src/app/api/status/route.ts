import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  let banco = "offline";

  try {
    await prisma.$queryRaw`SELECT 1`;
    banco = "online";

    return NextResponse.json({
      status: "online",
      banco,
      system: "LabView UFPI - Sistema de Laboratórios",
      institution: "Universidade Federal do Piauí (UFPI) - CSHNB Picos",
      authors: ["Luis G. L. D. Ramos", "Marcos Eduardo", "Veron"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao verificar o banco de dados:", error);

    return NextResponse.json(
      {
        status: "degradado",
        banco,
        system: "LabView UFPI - Sistema de Laboratórios",
        institution: "Universidade Federal do Piauí (UFPI) - CSHNB Picos",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}