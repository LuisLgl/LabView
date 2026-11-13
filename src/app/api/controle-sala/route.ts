import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_SESSAO,
  verificarTokenSessao,
} from "@/lib/auth";

export const runtime = "nodejs";

// VERIFICAR SESSÃO DO ADMINISTRADOR OU ALUNO
async function obterSessao(): Promise<{
  id: string;
  tipo: "admin" | "aluno";
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSAO)?.value;

  if (!token) return null;

  const sessao = await verificarTokenSessao(token);

  if (!sessao || typeof sessao.id !== "string") {
    return null;
  }

  // Verifica administrador
  if (sessao.tipo === "admin") {
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

    return {
      id: usuario.id,
      tipo: "admin",
    };
  }

  // Verifica aluno
  if (sessao.tipo === "aluno") {
    const aluno = await prisma.aluno.findUnique({
      where: { id: sessao.id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!aluno || aluno.status !== "ativo") {
      return null;
    }

    return {
      id: aluno.id,
      tipo: "aluno",
    };
  }

  return null;
}

// LISTAR ACESSOS — SOMENTE ADMINISTRADOR
export async function GET() {
  try {
    const sessao = await obterSessao();

    if (!sessao || sessao.tipo !== "admin") {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const acessos = await prisma.controleSala.findMany({
      orderBy: {
        entrada: "desc",
      },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            email: true,
            curso: true,
            status: true,
          },
        },
      },
    });

    const formatados = acessos.map((acesso) => ({
      id: acesso.id,
      aluno_id: acesso.alunoId,
      entrada: acesso.entrada,
      saida: acesso.saida,
      aluno: acesso.aluno,
    }));

    return NextResponse.json(formatados);
  } catch (error) {
    console.error("Erro ao buscar acessos:", error);

    return NextResponse.json(
      { error: "Erro ao buscar acessos." },
      { status: 500 }
    );
  }
}

// CHECK-IN OU CHECK-OUT
export async function POST(req: Request) {
  try {
    const sessao = await obterSessao();

    if (!sessao) {
      return NextResponse.json(
        { error: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // O aluno só pode registrar a própria matrícula.
    // O administrador pode informar qualquer matrícula.
    const alunoId =
      sessao.tipo === "aluno"
        ? sessao.id
        : String(body.aluno_id ?? "").trim();

    if (!alunoId) {
      return NextResponse.json(
        { error: "Matrícula é obrigatória." },
        { status: 400 }
      );
    }

    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      select: {
        id: true,
        nome: true,
        email: true,
        curso: true,
        status: true,
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: `Matrícula ${alunoId} não cadastrada.` },
        { status: 404 }
      );
    }

    if (aluno.status !== "ativo") {
      return NextResponse.json(
        { error: `O aluno ${aluno.nome} está com matrícula suspensa.` },
        { status: 403 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const acessoAberto = await tx.controleSala.findFirst({
        where: {
          alunoId,
          saida: null,
        },
        orderBy: {
          entrada: "desc",
        },
      });

      // CHECK-OUT
      if (acessoAberto) {
        const agora = new Date();

        const atualizado = await tx.controleSala.update({
          where: {
            id: acessoAberto.id,
          },
          data: {
            saida: agora,
          },
        });

        // Encerra também a sessão ativa do computador, se existir.
        const sessaoPC = await tx.controleComputadores.findFirst({
          where: {
            alunoId,
            fimUso: null,
          },
          orderBy: {
            inicioUso: "desc",
          },
        });

        if (sessaoPC) {
          await tx.controleComputadores.update({
            where: {
              id: sessaoPC.id,
            },
            data: {
              fimUso: agora,
            },
          });

          const outrasSessoes = await tx.controleComputadores.count({
            where: {
              computadorId: sessaoPC.computadorId,
              fimUso: null,
            },
          });

          if (outrasSessoes === 0) {
            const problemasPendentes = await tx.problemaComputador.count({
              where: {
                computadorId: sessaoPC.computadorId,
                status: "pendente",
              },
            });

            await tx.computador.update({
              where: {
                id: sessaoPC.computadorId,
              },
              data: {
                status: problemasPendentes > 0 ? "manutencao" : "disponivel",
              },
            });
          }
        }

        return {
          action: "checkout",
          acesso: {
            id: atualizado.id,
            aluno_id: atualizado.alunoId,
            entrada: atualizado.entrada,
            saida: atualizado.saida,
          },
        };
      }

      // CHECK-IN
      const novo = await tx.controleSala.create({
        data: {
          alunoId,
          entrada: new Date(),
        },
      });

      return {
        action: "checkin",
        acesso: {
          id: novo.id,
          aluno_id: novo.alunoId,
          entrada: novo.entrada,
          saida: novo.saida,
        },
      };
    });

    return NextResponse.json({
      ...resultado,
      aluno,
    });
  } catch (error) {
    console.error("Erro ao processar acesso:", error);

    return NextResponse.json(
      { error: "Erro ao processar acesso." },
      { status: 500 }
    );
  }
}