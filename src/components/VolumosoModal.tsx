import React, { useState } from 'react';
import { Package, X, Check, Box, Weight, Ruler, AlertCircle } from 'lucide-react';
import { VolumosoSubStatus } from '../types';

interface VolumosoModalProps {
  isOpen: boolean;
  codeCount: number;
  itemCode?: string;
  onSelect: (subStatus: string) => void;
  onClose: () => void;
}

const PRESET_SUB_STATUSES: {
  label: VolumosoSubStatus;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { label: 'Caixa Grande', icon: Box, description: 'Volume cúbico superior ao limite padrão' },
  { label: 'Saco Grande', icon: Package, description: 'Saco de carga pesada ou volumoso' },
  { label: 'Peso Elevado', icon: Weight, description: 'Acima de 15kg ou difícil manuseio' },
  { label: 'Formato Irregular', icon: AlertCircle, description: 'Tubos, cilindros ou peças não empilháveis' },
  { label: 'Pacote Longo', icon: Ruler, description: 'Comprimento maior que 100cm' },
  { label: 'Outro', icon: Package, description: 'Especificar detalhe manualmente' },
];

export const VolumosoModal: React.FC<VolumosoModalProps> = ({
  isOpen,
  codeCount,
  itemCode,
  onSelect,
  onClose,
}) => {
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handlePresetClick = (status: VolumosoSubStatus) => {
    if (status === 'Outro') {
      setShowCustomInput(true);
    } else {
      onSelect(status);
      setCustomText('');
      setShowCustomInput(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onSelect(customText.trim());
      setCustomText('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Classificar Item Volumoso</h3>
              <p className="text-amber-100 text-xs">
                {codeCount > 1
                  ? `Aplicando para ${codeCount} códigos selecionados em lote`
                  : itemCode
                  ? `Código: ${itemCode}`
                  : 'Selecione a característica do volume'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showCustomInput ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_SUB_STATUSES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handlePresetClick(item.label)}
                    className="flex flex-col items-start p-3.5 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-gray-900 group-hover:text-amber-900">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-amber-700/80 leading-snug">
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Descreva o detalhe do Volumoso:
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ex: Cadeira desmontada, Rolo de tecido 2m..."
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!customText.trim()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Detalhe
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
