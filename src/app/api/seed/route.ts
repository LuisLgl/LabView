import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // 1. Limpa tabelas
    await prisma.problemaComputador.deleteMany();
    await prisma.controleComputadores.deleteMany();
    await prisma.controleSala.deleteMany();
    await prisma.computador.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.usuario.deleteMany();

    // 2. USUARIOS
    const u1 = await prisma.usuario.create({
      data: {
        id: 'usr-01',
        nome: 'Prof. Luis Ramos',
        email: 'luis.ramos@ufpi.edu.br',
        senha_hash: 'hash_admin_123',
        perfil: 'Administrador'
      }
    });

    const u2 = await prisma.usuario.create({
      data: {
        id: 'usr-02',
        nome: 'Marcos Eduardo',
        email: 'marcos@ufpi.edu.br',
        senha_hash: 'hash_admin_456',
        perfil: 'Administrador'
      }
    });

    const u3 = await prisma.usuario.create({
      data: {
        id: 'usr-03',
        nome: 'Monitor Veron',
        email: 'veron@ufpi.edu.br',
        senha_hash: 'hash_monitor_789',
        perfil: 'Monitor'
      }
    });

    // 3. ALUNOS
    const a1 = await prisma.aluno.create({
      data: {
        id: '2024901234',
        nome: 'Gabriel Silva Santos',
        email: 'gabriel.silva@aluno.ufpi.edu.br',
        curso: 'Sistemas de Informação',
        status: 'ativo',
        cadastrado_por: u1.id
      }
    });

    const a2 = await prisma.aluno.create({
      data: {
        id: '2024905678',
        nome: 'Larissa Medeiros Feitosa',
        email: 'larissa.feitosa@aluno.ufpi.edu.br',
        curso: 'Sistemas de Informação',
        status: 'ativo',
        cadastrado_por: u1.id
      }
    });

    const a3 = await prisma.aluno.create({
      data: {
        id: '2023908899',
        nome: 'Carlos Eduardo Moura',
        email: 'carlos.moura@aluno.ufpi.edu.br',
        curso: 'Sistemas de Informação',
        status: 'ativo',
        cadastrado_por: u2.id
      }
    });

    const a4 = await prisma.aluno.create({
      data: {
        id: '2023904411',
        nome: 'Ana Beatriz Cavalcanti',
        email: 'ana.beatriz@aluno.ufpi.edu.br',
        curso: 'Administração',
        status: 'ativo',
        cadastrado_por: u3.id
      }
    });

    // 4. COMPUTADORES
    const pcsData = [
      { id: 1, host: 'LAB-01', pat: 'UFPI-CSHNB-4081', status: 'disponivel', specs: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS' },
      { id: 2, host: 'LAB-02', pat: 'UFPI-CSHNB-4082', status: 'ocupado', specs: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Windows 11 Pro' },
      { id: 3, host: 'LAB-03', pat: 'UFPI-CSHNB-4083', status: 'disponivel', specs: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS' },
      { id: 4, host: 'LAB-04', pat: 'UFPI-CSHNB-4084', status: 'ocupado', specs: 'AMD Ryzen 7 5700G, 32GB RAM, SSD 1TB, Dual Boot (Linux/Win)' },
      { id: 5, host: 'LAB-05', pat: 'UFPI-CSHNB-4085', status: 'manutencao', specs: 'Intel Core i5 10ª Gen, 8GB RAM, SSD 256GB - Fonte com ruído' },
      { id: 6, host: 'LAB-06', pat: 'UFPI-CSHNB-4086', status: 'disponivel', specs: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS' },
      { id: 7, host: 'LAB-07', pat: 'UFPI-CSHNB-4087', status: 'disponivel', specs: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS' },
      { id: 8, host: 'LAB-08', pat: 'UFPI-CSHNB-4088', status: 'ocupado', specs: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Windows 11 Pro' },
      { id: 9, host: 'LAB-09', pat: 'UFPI-CSHNB-4089', status: 'disponivel', specs: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 512GB, Ubuntu 24.04 LTS' },
      { id: 10, host: 'LAB-10', pat: 'UFPI-CSHNB-4090', status: 'disponivel', specs: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 512GB, Ubuntu 24.04 LTS' },
      { id: 11, host: 'LAB-11', pat: 'UFPI-CSHNB-4091', status: 'disponivel', specs: 'AMD Ryzen 7 5700G, 32GB RAM, SSD 1TB, Linux Mint' },
      { id: 12, host: 'LAB-12', pat: 'UFPI-CSHNB-4092', status: 'disponivel', specs: 'AMD Ryzen 7 5700G, 32GB RAM, SSD 1TB, Windows 11 Pro' }
    ];

    for (const p of pcsData) {
      await prisma.computador.create({
        data: {
          id: p.id,
          nome_host: p.host,
          patrimonio: p.pat,
          status: p.status,
          especificacoes: p.specs,
          cadastrado_por: u1.id
        }
      });
    }

    // 5. CONTROLE_SALA
    await prisma.controleSala.create({
      data: { aluno_id: a1.id, entrada: new Date(Date.now() - 3600000 * 2), saida: null }
    });
    await prisma.controleSala.create({
      data: { aluno_id: a2.id, entrada: new Date(Date.now() - 3600000 * 1.5), saida: null }
    });
    await prisma.controleSala.create({
      data: { aluno_id: a3.id, entrada: new Date(Date.now() - 3600000 * 1), saida: null }
    });

    // 6. CONTROLE_COMPUTADORES
    await prisma.controleComputadores.create({
      data: { aluno_id: a1.id, computador_id: 2, inicio_uso: new Date(Date.now() - 3600000 * 1.8), fim_uso: null }
    });
    await prisma.controleComputadores.create({
      data: { aluno_id: a2.id, computador_id: 4, inicio_uso: new Date(Date.now() - 3600000 * 1.2), fim_uso: null }
    });
    await prisma.controleComputadores.create({
      data: { aluno_id: a3.id, computador_id: 8, inicio_uso: new Date(Date.now() - 3600000 * 0.9), fim_uso: null }
    });

    // 7. PROBLEMAS_COMPUTADORES
    await prisma.problemaComputador.create({
      data: {
        computador_id: 5,
        descricao: 'Cooler da fonte emitindo ruído elevado e reiniciando aleatoriamente durante compilações pesadas.',
        data_registro: new Date('2026-03-25T10:30:00.000Z'),
        status: 'pendente',
        registrado_por: u1.id
      }
    });

    return NextResponse.json({ success: true, message: 'Banco de dados reinicializado com sucesso!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao popular banco' }, { status: 500 });
  }
}
