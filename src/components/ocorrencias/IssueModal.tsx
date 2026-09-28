'use client';

import React, { useState } from 'react';
import { AlertTriangle, Monitor, PlusCircle, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Computador } from '@/types';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  computadores: Computador[];
  initialPcId?: number | null;
  onSubmit: (pcId: number, descricao: string) => void;
}

export default function IssueModal({
  isOpen,
  onClose,
  computadores,
  initialPcId,
  onSubmit
}: IssueModalProps) {
  const [selectedPcId, setSelectedPcId] = useState<number>(initialPcId || (computadores[0]?.id ?? 1));
  const [descricao, setDescricao] = useState('');

  React.useEffect(() => {
    if (initialPcId) {
      setSelectedPcId(initialPcId);
    } else if (computadores.length > 0 && !selectedPcId) {
      setSelectedPcId(computadores[0].id);
    }
  }, [initialPcId, computadores, selectedPcId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPcId || !descricao.trim()) return;

    onSubmit(selectedPcId, descricao.trim());
    setDescricao('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Abrir Ocorrência / Chamado Técnico"
      subtitle="Registre uma avaria, problema de software ou hardware em um computador"
      icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
            Selecione o Computador *
          </label>
          <div className="relative">
            <select
              value={selectedPcId}
              onChange={(e) => setSelectedPcId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs font-semibold text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none"
            >
              {computadores.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome_host} • {c.patrimonio} ({c.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[var(--text-main)] block mb-1">
            Descrição Detalhada do Defeito / Falha *
          </label>
          <textarea
            required
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Teclado não responde, tela azul intermitente, erro ao inicializar o Ubuntu, cabo de rede rompido..."
            className="w-full p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-[12px] text-xs text-[var(--text-main)] focus:border-[var(--border-focus)] outline-none leading-relaxed"
          />
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-[12px] text-xs text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Aviso Operacional:</p>
          <p className="text-[0.72rem] opacity-90 mt-0.5">
            Ao abrir o chamado, o status da estação será automaticamente alterado para <strong>manutenção</strong> caso esteja disponível.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-xs"
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary text-xs bg-red-600 hover:bg-red-700">
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Ocorrência</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
