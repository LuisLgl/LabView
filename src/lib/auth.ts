import { SignJWT, jwtVerify } from "jose";

export const COOKIE_SESSAO = "labview_session";

function obterChaveSecreta() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET não configurada corretamente.");
  }

  return new TextEncoder().encode(secret);
}

export async function criarTokenSessao(dados: {
  id: string;
  tipo: "admin" | "aluno";
  perfil?: string;
}) {
  return new SignJWT(dados)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(obterChaveSecreta());
}

export async function verificarTokenSessao(token: string) {
  try {
    const { payload } = await jwtVerify(token, obterChaveSecreta());
    return payload;
  } catch {
    return null;
  }
}