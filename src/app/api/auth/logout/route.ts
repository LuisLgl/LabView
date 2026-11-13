import { NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    sucesso: true,
    mensagem: "Sessão encerrada com sucesso.",
  });

  response.cookies.set(COOKIE_SESSAO, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}