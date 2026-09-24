import React, { useState } from 'react';
import { Settings, X, Save, RefreshCw, Volume2, Shield, Link2, CheckCircle2 } from 'lucide-react';
import { AppConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onClose: () => void;
  isAdmin: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onSaveConfig,
  onClose,
  isAdmin,
}) => {
  const [googleScriptUrl, setGoogleScriptUrl] = useState(config.googleScriptUrl);
  const [codeLength, setCodeLength] = useState(config.codeLength);
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);
  const [autoSendToSheets, setAutoSendToSheets] = useState(config.autoSendToSheets);
  const [adminUsers, setAdminUsers] = useState(config.adminUsers.join(', '));
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAdmins = adminUsers
      .split(',')
      .map((u) => u.trim().toLowerCase())
      .filter((u) => u.length > 0);

    onSaveConfig({
      googleScriptUrl: googleScriptUrl.trim(),
      codeLength: Number(codeLength) || 15,
      soundEnabled,
      autoSendToSheets,
      adminUsers: cleanAdmins,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <Settings className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Configurações da Operação</h3>
              <p className="text-gray-400 text-xs">Ajustes de integração e preferências</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Google Sheets URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#EE4D2D]" />
              URL do Google Apps Script (Web App)
            </label>
            <input
              type="url"
              value={googleScriptUrl}
              onChange={(e) => setGoogleScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#EE4D2D] outline-none"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Endpoint para registro em tempo real das coletas na planilha de controle da Shopee.
            </p>
          </div>

          {/* Barcode Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Tamanho Padrão do Código
              </label>
              <input
                type="number"
                min={5}
                max={40}
                value={codeLength}
                onChange={(e) => setCodeLength(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#EE4D2D] outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Padrão operacional: 15 dígitos.
              </p>
            </div>

            {/* Sound Feedback */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Bipe Sonoro
              </label>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-gray-100 border-gray-200 text-gray-600'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                {soundEnabled ? 'Bipe Ativado (Áudio OK)' : 'Bipe Silenciado'}
              </button>
              <p className="text-[11px] text-gray-500 mt-1">
                Sinal sonoro instantâneo ao bipar com sucesso.
              </p>
            </div>
          </div>

          {/* Auto Send Toggle */}
          <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Envio Automático para Google Sheets
              </span>
              <span className="text-[11px] text-gray-600">
                Dispara cada bipagem diretamente para a nuvem sem travar a interface
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoSendToSheets}
              onChange={(e) => setAutoSendToSheets(e.target.checked)}
              className="w-5 h-5 accent-[#EE4D2D] rounded cursor-pointer"
            />
          </div>

          {/* Admin users */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-600" />
                Nomes de Administradores (separados por vírgula)
              </label>
              <input
                type="text"
                value={adminUsers}
                onChange={(e) => setAdminUsers(e.target.value)}
                placeholder="anderson chiesa, júlia martins, igor santos"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#EE4D2D] outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Usuários com permissão para gerenciar configurações e limpar histórico.
              </p>
            </div>
          )}

          {/* Success Banner */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Configurações salvas com sucesso!
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#EE4D2D] hover:bg-[#D03E1F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#EE4D2D]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Preferências
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
