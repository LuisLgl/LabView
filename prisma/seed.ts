import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando banco de dados com dados da UFPI CSHNB Picos...');

  // Limpa tabelas
  await prisma.problemaComputador.deleteMany();
  await prisma.controleComputadores.deleteMany();
  await prisma.controleSala.deleteMany();
  await prisma.computador.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.usuario.deleteMany();

  // 1. USUARIOS
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

  // 2. ALUNOS
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

  const a5 = await prisma.aluno.create({
    data: {
      id: '2022901122',
      nome: 'Mateus Alencar Rocha',
      email: 'mateus.rocha@aluno.ufpi.edu.br',
      curso: 'Sistemas de Informação',
      status: 'ativo',
      cadastrado_por: u1.id
    }
  });

  const a6 = await prisma.aluno.create({
    data: {
      id: '2021903344',
      nome: 'Juliana Ferreira Lima',
      email: 'juliana.lima@aluno.ufpi.edu.br',
      curso: 'Ciências Biológicas',
      status: 'suspenso',
      cadastrado_por: u2.id
    }
  });

  // 3. COMPUTADORES
  const pc1 = await prisma.computador.create({
    data: {
      id: 1,
      patrimonio: 'UFPI-CSHNB-4081',
      nome_host: 'LAB-01',
      status: 'disponivel',
      especificacoes: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS',
      cadastrado_por: u1.id
    }
  });

  const pc2 = await prisma.computador.create({
    data: {
      id: 2,
      patrimonio: 'UFPI-CSHNB-4082',
      nome_host: 'LAB-02',
      status: 'ocupado',
      especificacoes: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Windows 11 Pro',
      cadastrado_por: u1.id
    }
  });

  const pc3 = await prisma.computador.create({
    data: {
      id: 3,
      patrimonio: 'UFPI-CSHNB-4083',
      nome_host: 'LAB-03',
      status: 'disponivel',
      especificacoes: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS',
      cadastrado_por: u1.id
    }
  });

  const pc4 = await prisma.computador.create({
    data: {
      id: 4,
      patrimonio: 'UFPI-CSHNB-4084',
      nome_host: 'LAB-04',
      status: 'ocupado',
      especificacoes: 'AMD Ryzen 7 5700G, 32GB RAM, SSD 1TB, Dual Boot (Linux/Win)',
      cadastrado_por: u2.id
    }
  });

  const pc5 = await prisma.computador.create({
    data: {
      id: 5,
      patrimonio: 'UFPI-CSHNB-4085',
      nome_host: 'LAB-05',
      status: 'manutencao',
      especificacoes: 'Intel Core i5 10ª Gen, 8GB RAM, SSD 256GB - Fonte com ruído',
      cadastrado_por: u1.id
    }
  });

  const pc6 = await prisma.computador.create({
    data: {
      id: 6,
      patrimonio: 'UFPI-CSHNB-4086',
      nome_host: 'LAB-06',
      status: 'disponivel',
      especificacoes: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS',
      cadastrado_por: u1.id
    }
  });

  const pc7 = await prisma.computador.create({
    data: {
      id: 7,
      patrimonio: 'UFPI-CSHNB-4087',
      nome_host: 'LAB-07',
      status: 'disponivel',
      especificacoes: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS',
      cadastrado_por: u2.id
    }
  });

  const pc8 = await prisma.computador.create({
    data: {
      id: 8,
      patrimonio: 'UFPI-CSHNB-4088',
      nome_host: 'LAB-08',
      status: 'ocupado',
      especificacoes: 'Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Windows 11 Pro',
      cadastrado_por: u1.id
    }
  });

  const pc9 = await prisma.computador.create({
    data: {
      id: 9,
      patrimonio: 'UFPI-CSHNB-4089',
      nome_host: 'LAB-09',
      status: 'disponivel',
      especificacoes: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 512GB, Ubuntu 24.04 LTS',
      cadastrado_por: u3.id
    }
  });

  const pc10 = await prisma.computador.create({
    data: {
      id: 10,
      patrimonio: 'UFPI-CSHNB-4090',
      nome_host: 'LAB-10',
      status: 'disponivel',
      especificacoes: 'Intel Core i5 11ª Gen, 16GB RAM, SSD 512GB, Ubuntu 24.04 LTS',
      cadastrado_por: u3.id
    }
  });

  const pc11 = await prisma.computador.create({
    data: {
      id: 11,
      patrimonio: 'UFPI-CSHNB-4091',
      nome_host: 'LAB-11',
      status: 'disponivel',
      especificacoes: 'AMD Ryzen 7 5700G, 32GB RAM, SSD 1TB, Linux Mint',
      cadastrado_por: u2.id
    }
  });

  const pc12 = await prisma.computador.create({
    data: {
      id: 12,
      patrimonio: 'UFPI-CSHNB-4092',
      nome_host: 'LAB-12',
      status: 'disponivel',
      especificacoes: 'AMD Ryzen 7 5700G, 32GB RAM, SSD 1TB, Windows 11 Pro',
      cadastrado_por: u2.id
    }
  });

  // 4. CONTROLE_SALA
  await prisma.controleSala.create({
    data: {
      aluno_id: a1.id,
      entrada: new Date(Date.now() - 3600000 * 2),
      saida: null
    }
  });

  await prisma.controleSala.create({
    data: {
      aluno_id: a2.id,
      entrada: new Date(Date.now() - 3600000 * 1.5),
      saida: null
    }
  });

  await prisma.controleSala.create({
    data: {
      aluno_id: a3.id,
      entrada: new Date(Date.now() - 3600000 * 1),
      saida: null
    }
  });

  await prisma.controleSala.create({
    data: {
      aluno_id: a4.id,
      entrada: new Date(Date.now() - 3600000 * 4),
      saida: new Date(Date.now() - 3600000 * 2.5)
    }
  });

  // 5. CONTROLE_COMPUTADORES
  await prisma.controleComputadores.create({
    data: {
      aluno_id: a1.id,
      computador_id: pc2.id,
      inicio_uso: new Date(Date.now() - 3600000 * 1.8),
      fim_uso: null
    }
  });

  await prisma.controleComputadores.create({
    data: {
      aluno_id: a2.id,
      computador_id: pc4.id,
      inicio_uso: new Date(Date.now() - 3600000 * 1.2),
      fim_uso: null
    }
  });

  await prisma.controleComputadores.create({
    data: {
      aluno_id: a3.id,
      computador_id: pc8.id,
      inicio_uso: new Date(Date.now() - 3600000 * 0.9),
      fim_uso: null
    }
  });

  // 6. PROBLEMAS_COMPUTADORES
  await prisma.problemaComputador.create({
    data: {
      computador_id: pc5.id,
      descricao: 'Cooler da fonte emitindo ruído elevado e reiniciando aleatoriamente durante compilações pesadas.',
      data_registro: new Date('2026-03-25T10:30:00.000Z'),
      status: 'pendente',
      registrado_por: u1.id
    }
  });

  await prisma.problemaComputador.create({
    data: {
      computador_id: pc3.id,
      descricao: "Teclado com teclas 'Enter' e 'Espaço' falhando intermitentemente.",
      data_registro: new Date('2026-03-20T14:10:00.000Z'),
      data_resolucao: new Date('2026-03-21T09:00:00.000Z'),
      status: 'resolvido',
      registrado_por: u3.id
    }
  });

  console.log('✅ Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
