import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: usuarios, error } = await supabase
      .from('USUARIOS')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) throw error;
    return NextResponse.json(usuarios);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data: usuario, error } = await supabase
      .from('USUARIOS')
      .insert([{
        nome: body.nome,
        email: body.email,
        perfil: body.perfil || 'Administrador',
        senha_hash: body.senha_hash || 'hash_default'
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(usuario);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar usuário' }, { status: 400 });
  }
}
