import React, { useState, useRef, useEffect } from 'react';
import {
  Barcode,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Zap,
  Trash2,
  Copy,
  Check,
  CornerDownLeft,
} from 'lucide-react';
import { ScanStatus, STATUS_CONFIG } from '../types';

interface ScannerPanelProps {
  onScanSingle: (code: string, status: ScanStatus) => boolean;
  onScanBatch: (codes: string[], status: ScanStatus) => void;
  expectedLength: number;
}

export const ScannerPanel: React.FC<ScannerPanelProps> = ({
  onScanSingle,
  onScanBatch,
  expectedLength = 15,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single mode state
  const [singleCode, setSingleCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [autoStatusMode, setAutoStatusMode] = useState<ScanStatus | null>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  // Batch mode state
  const [batchText, setBatchText] = useState('');
  const [parsedValidCodes, setParsedValidCodes] = useState<string[]>([]);
  const [invalidCount, setInvalidCount] = useState(0);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  // Focus single input automatically
  useEffect(() => {
    if (activeTab === 'single') {
      singleInputRef.current?.focus();
    }
  }, [activeTab]);

  // Keep single input focused after actions
  const focusSingleInput = () => {
    setTimeout(() => {
      singleInputRef.current?.focus();
    }, 50);
  };

  // Parse batch text live
  useEffect(() => {
    if (!batchText.trim()) {
      setParsedValidCodes([]);
      setInvalidCount(0);
      return;
    }

    const tokens = batchText
      .split(/[\r\n\t,;\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const valid: string[] = [];
    let invalid = 0;

    tokens.forEach((t) => {
      // Remove common prefix/suffix artifacts if any, but test exact length
      const cleaned = t.replace(/[^A-Za-z0-9]/g, '');
      if (cleaned.length === expectedLength) {
        valid.push(cleaned);
      } else {
        invalid++;
      }
    });

    // Remove duplicates inside same batch paste if desired, or keep as scanned
    setParsedValidCodes(valid);
    setInvalidCount(invalid);
  }, [batchText, expectedLength]);

  // Handle single code change
  const handleSingleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toUpperCase();
    setSingleCode(val);
    if (errorMessage) setErrorMessage('');

    // If auto status is active and code hits 15 characters, auto process
    if (autoStatusMode && val.length === expectedLength) {
      const ok = onScanSingle(val, autoStatusMode);
      if (ok) {
        setSuccessToast(`Bipado: ${val} (${autoStatusMode})`);
        setSingleCode('');
        setTimeout(() => setSuccessToast(null), 2500);
      }
      focusSingleInput();
    }
  };

  // Handle key press on single input
  const handleSingleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = singleCode.trim().toUpperCase();
      if (!code) return;

      if (code.length !== expectedLength) {
        setErrorMessage(`Código deve ter exatamente ${expectedLength} dígitos (atual: ${code.length})`);
        return;
      }

      // If auto status is enabled, process
      if (autoStatusMode) {
        const ok = onScanSingle(code, autoStatusMode);
        if (ok) {
          setSuccessToast(`Bipado: ${code} (${autoStatusMode})`);
          setSingleCode('');
          setTimeout(() => setSuccessToast(null), 2500);
        }
      } else {
        setErrorMessage('Selecione um dos botões de status abaixo para registrar.');
      }
    }
  };

  // Handle status button click in single mode
  const handleStatusClick = (status: ScanStatus) => {
    const code = singleCode.trim().toUpperCase();
    if (!code) {
      setErrorMessage('Bipe ou digite o código do pacote primeiro.');
      focusSingleInput();
      return;
    }

    if (code.length !== expectedLength) {
      setErrorMessage(`O código deve ter exatamente ${expectedLength} dígitos (atual: ${code.length}).`);
      focusSingleInput();
      return;
    }

    const ok = onScanSingle(code, status);
    if (ok) {
      setSuccessToast(`Registrado com sucesso: ${code} -> ${status}`);
      setSingleCode('');
      setErrorMessage('');
      setTimeout(() => setSuccessToast(null), 2500);
    }
    focusSingleInput();
  };

  // Process batch
  const handleProcessBatch = (status: ScanStatus) => {
    if (parsedValidCodes.length === 0) {
      setErrorMessage(`Nenhum código válido com ${expectedLength} dígitos encontrado na caixa.`);
      return;
    }

    onScanBatch(parsedValidCodes, status);
    setBatchSuccessMsg(`${parsedValidCodes.length} pacotes registrados com status "${status}"!`);
    setBatchText('');
    setParsedValidCodes([]);
    setInvalidCount(0);
    setErrorMessage('');
    setTimeout(() => setBatchSuccessMsg(null), 4000);
  };

  const statuses: ScanStatus[] = [
    'SOC',
    'Roteirizar',
    'Avariado',
    'Volumoso',
    'Item Voando',
    'Duplicidade',
    'Interceptado',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 sm:p-6 transition-all">
      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4 mb-5">
        <div className="flex items-center gap-2 bg-gray-100/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Barcode className="w-4 h-4 text-[#EE4D2D]" />
            Modo Unitário (Bip)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            Modo em Lote (Multi)
          </button>
        </div>

        {/* Continuous Auto-Status indicator for single mode */}
        {activeTab === 'single' && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Fluxo Contínuo:</span>
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setAutoStatusMode(null)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  autoStatusMode === null
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Manual
              </button>
              {statuses.slice(0, 4).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAutoStatusMode(autoStatusMode === st ? null : st)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded transition-all ${
                    autoStatusMode === st
                      ? 'bg-[#EE4D2D] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SINGLE MODE */}
      {activeTab === 'single' && (
        <div className="space-y-4">
          {/* Input Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <label htmlFor="barcode-input" className="flex items-center gap-1.5">
                <Barcode className="w-4 h-4 text-[#EE4D2D]" />
                Bipar Código de Barras (15 Dígitos)
              </label>
              <span
                className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold ${
                  singleCode.length === expectedLength
                    ? 'bg-emerald-100 text-emerald-800'
                    : singleCode.length > expectedLength
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {singleCode.length} / {expectedLength} dígitos
              </span>
            </div>

            <div className="relative">
              <input
                id="barcode-input"
                ref={singleInputRef}
                type="text"
                value={singleCode}
                onChange={handleSingleInputChange}
                onKeyDown={handleSingleKeyDown}
                placeholder="Aponte o leitor ou digite o código..."
                maxLength={25}
                autoComplete="off"
                spellCheck={false}
                className={`w-full font-mono text-lg sm:text-xl font-bold tracking-wider py-3.5 px-4 pr-12 rounded-xl border-2 transition-all outline-none bg-gray-50/70 focus:bg-white ${
                  singleCode.length === expectedLength
                    ? 'border-emerald-500 ring-4 ring-emerald-50 text-gray-900'
                    : errorMessage
                    ? 'border-red-500 ring-4 ring-red-50 text-red-900'
                    : 'border-gray-200 focus:border-[#EE4D2D] focus:ring-4 focus:ring-orange-50'
                }`}
              />

              {singleCode && (
                <button
                  type="button"
                  onClick={() => {
                    setSingleCode('');
                    focusSingleInput();
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Error or Alert Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-200 animate-shake">
                <AlertOctagon className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Toast */}
            {successToast && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successToast}</span>
              </div>
            )}
          </div>

          {/* Status Buttons Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Classificar e Registrar Status:
              </span>
              <span className="text-[11px] text-gray-400">
                Ou pressione no teclado
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
              {statuses.map((status) => {
                const conf = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusClick(status)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border bg-white shadow-xs hover:shadow-md transition-all group active:scale-[0.98] cursor-pointer text-center border-l-4 ${conf.borderLeftColor} border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 min-h-[70px]`}
                  >
                    <span className="text-sm font-extrabold text-gray-900 group-hover:text-gray-950 block leading-tight">
                      {status}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-600 mt-1 line-clamp-1">
                      {status === 'Volumoso' ? 'Abrir detalhes' : 'Bipar status'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BATCH MODE */}
      {activeTab === 'batch' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Cole a lista de códigos (um por linha ou separados por espaço)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-xs border border-indigo-200">
                {parsedValidCodes.length} válidos ({expectedLength} dígitos)
              </span>
              {invalidCount > 0 && (
                <span className="font-mono bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-xs border border-rose-200">
                  {invalidCount} ignorados
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="Exemplo:&#10;BR2612345678901&#10;BR2612345678902&#10;BR2612345678903"
              rows={5}
              className="w-full p-3 font-mono text-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-y bg-gray-50/60 focus:bg-white"
            />
            {batchText && (
              <button
                type="button"
                onClick={() => setBatchText('')}
                className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-gray-700 bg-white/80 rounded-lg shadow-xs hover:bg-gray-100"
                title="Limpar caixa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {batchSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {batchSuccessMsg}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              {errorMessage}
            </div>
          )}

          {/* Batch action buttons */}
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Aplicar Status a Todos os {parsedValidCodes.length} Códigos:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
              {statuses.map((status) => {
                const conf = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={parsedValidCodes.length === 0}
                    onClick={() => handleProcessBatch(status)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border bg-white shadow-xs transition-all group cursor-pointer text-center border-l-4 ${conf.borderLeftColor} border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 disabled:opacity-40 disabled:cursor-not-allowed min-h-[60px]`}
                  >
                    <span className="text-sm font-extrabold text-gray-900 group-hover:text-gray-950 block">
                      {status}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
                      Processar {parsedValidCodes.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
