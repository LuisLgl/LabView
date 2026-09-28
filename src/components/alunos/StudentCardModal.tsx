'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Copy, Check, QrCode, Sparkles, GraduationCap } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Aluno } from '@/types';
import { useLab } from '@/context/LabContext';

interface StudentCardModalProps {
  aluno: Aluno | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentCardModal({
  aluno,
  isOpen,
  onClose
}: StudentCardModalProps) {
  const { showToast } = useLab();
  const [copied, setCopied] = React.useState(false);

  if (!aluno) return null;

  const handleCopyMatricula = () => {
    navigator.clipboard.writeText(aluno.id);
    setCopied(true);
    showToast(`Matrícula ${aluno.id} copiada!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Carteirinha Digital de Acesso UFPI"
      subtitle="Identificação estudantil para entrada no laboratório de informática"
      icon={<QrCode className="w-5 h-5" />}
      maxWidth="md"
    >
      <div className="flex flex-col items-center gap-5">
        {/* Physical Badge Preview */}
        <div className="w-full max-w-sm rounded-[24px] bg-gradient-to-br from-[#1C103E] via-[#2D1B69] to-[#5E3BEE] text-white p-6 shadow-2xl border-2 border-white/20 relative overflow-hidden flex flex-col items-center text-center">
          {/* Subtle Background Badge Decor */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[var(--purple-500)]/20 rounded-full blur-xl pointer-events-none" />

          {/* Badge Header */}
          <div className="flex items-center justify-between w-full pb-3 mb-4 border-b border-white/15">
            <div className="text-left">
              <span className="font-extrabold text-xs tracking-wider uppercase text-purple-200 block">
                Universidade Federal do Piauí
              </span>
              <span className="text-[0.65rem] text-purple-300 font-medium">
                Campus Senador Helvídio Nunes de Barros
              </span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-white/10 text-[0.65rem] font-bold tracking-wider text-purple-200 border border-white/20 uppercase">
              CSHNB
            </div>
          </div>

          {/* Student Avatar + Names */}
          <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/30 text-white flex items-center justify-center font-extrabold text-2xl mb-3 shadow-inner">
            {aluno.nome.charAt(0)}
          </div>

          <h3 className="font-extrabold text-base tracking-tight text-white mb-0.5">
            {aluno.nome}
          </h3>
          <p className="text-xs text-purple-200 font-medium flex items-center gap-1 mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{aluno.curso}</span>
          </p>

          {/* QR Code Container */}
          <div className="p-3.5 bg-white rounded-[16px] shadow-lg mb-3">
            <QRCodeSVG
              value={aluno.id}
              size={130}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Student ID badge tag */}
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/15">
            <span className="text-[0.65rem] text-purple-300 uppercase font-bold tracking-wider">Matrícula:</span>
            <span className="text-xs font-mono font-extrabold text-white tracking-widest">{aluno.id}</span>
          </div>

          <span className="text-[0.62rem] text-purple-300 mt-3">
            Apresente na portaria para registro automático de entrada e saída
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 w-full max-w-sm">
          <button
            onClick={handleCopyMatricula}
            className="flex-1 btn btn-secondary text-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Matrícula'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 btn btn-primary text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Crachá</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
