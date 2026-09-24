import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface AdminClearModalProps {
  isOpen: boolean;
  onConfirmClear: () => void;
  onClose: () => void;
  recordCount: number;
}

export const AdminClearModal: React.FC<AdminClearModalProps> = ({
  isOpen,
  onConfirmClear,
  onClose,
  recordCount,
}) => {
  const [confirmWord, setConfirmWord] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmWord.trim().toUpperCase() === 'LIMPAR';

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirmClear();
      setConfirmWord('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
        <div className="bg-red-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Limpar Histórico Local</h3>
              <p className="text-red-100 text-xs">Ação restrita de supervisor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Atenção: Esta ação é irreversível!</p>
              <p className="text-red-700">
                Você está prestes a apagar todos os <strong>{recordCount} registros</strong> salvos
                neste navegador. Certifique-se de que os dados foram sincronizados ou exportados em Excel/CSV.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Digite a palavra <span className="text-red-600 font-mono">LIMPAR</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmWord}
              onChange={(e) => setConfirmWord(e.target.value)}
              placeholder="LIMPAR"
              autoFocus
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-center font-mono font-bold text-base tracking-widest uppercase focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!isConfirmed}
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Confirmar Exclusão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
