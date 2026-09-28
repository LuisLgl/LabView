'use client';

import React, { useState } from 'react';
import { PlusCircle, Monitor, Cpu, Hash } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { ComputerStatus } from '@/types';

interface AddComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    nome_host: string;
    patrimonio: string;
    status: ComputerStatus;
    especificacoes?: string;
  }) => void;
}

export default function AddComputerModal({
  isOpen,
  onClose,
  onAdd
}: AddComputerModalProps) {
  const [host, setHost] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [status, setStatus] = useState<ComputerStatus>('disponivel');
  const [specs, setSpecs] = useState('Intel Core i7 12ª Gen, 16GB RAM, SSD 512GB NVMe, Ubuntu 24.04 LTS');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim() || !patrimonio.trim()) return;

    onAdd({
      nome_host: host.trim().toUpperCase(),
      patrimonio: patrimonio.trim().toUpperCase(),
      status,
      especificacoes: specs.trim()
    });

    setHost('');
    setPatrimonio('');
    setStatus('disponivel');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Computador"
      subtitle="Adicionar estação de trabalho ao parque tecnológico do laboratório"
      icon={<PlusCircle className="w-5 h-5" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
            Nome do Host / Identificador da Estação *
          </label>
          <div className="relative">
            <Monitor className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              required
              placeholder="Ex: LAB-13, LAB-14..."
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full pl-9.5 pr-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-mono font-bold text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
            Número de Tombamento / Patrimônio UFPI *
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              required
              placeholder="Ex: UFPI-CSHNB-4093"
              value={patrimonio}
              onChange={(e) => setPatrimonio(e.target.value)}
              className="w-full pl-9.5 pr-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-mono text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
            Status Operacional Inicial
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ComputerStatus)}
            className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] font-medium focus:border-[var(--border-focus)] outline-none"
          >
            <option value="disponivel">Disponível para Uso</option>
            <option value="manutencao">Em Manutenção / Aguardando Reparo</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
            Especificações de Hardware / Sistema Operacional
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              placeholder="Processador, Memória RAM, Armazenamento, SO..."
              className="w-full p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs"
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary text-xs">
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Estação</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
