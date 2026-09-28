import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { criado_em: 'asc' }
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const usuario = await prisma.usuario.create({
      data: {
        nome: body.nome,
        email: body.email,
        perfil: body.perfil || 'Administrador',
        senha_hash: body.senha_hash || 'hash_default'
      }
    });
    return NextResponse.json(usuario);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar usuário' }, { status: 400 });
  }
}
