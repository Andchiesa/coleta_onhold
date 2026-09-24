import React from 'react';
import {
  LogOut,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  SunMedium,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import { ShiftType } from '../types';

interface HeaderProps {
  currentUser: string;
  currentShift: ShiftType;
  onShiftChange: (shift: ShiftType) => void;
  onLogout: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenAdminClear?: () => void;
  isAdmin: boolean;
  isSyncing: boolean;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentShift,
  onShiftChange,
  onLogout,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenAdminClear,
  isAdmin,
  isSyncing,
  totalRecordsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EE4D2D] to-[#D03E1F] flex items-center justify-center text-white font-black text-sm tracking-wider shadow-md shadow-[#EE4D2D]/20">
              SPX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gray-900 text-base sm:text-lg tracking-tight">
                  Recebimento Onhold
                </span>
                <span className="bg-[#EE4D2D]/10 text-[#EE4D2D] font-bold text-[11px] px-2 py-0.5 rounded-md uppercase">
                  LRJ07
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                Controle Operacional de Bipagem & Triagem
              </p>
            </div>
          </div>

          {/* Sync indicator */}
          <div className="flex items-center gap-2 sm:ml-4">
            {isSyncing ? (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Sincronizando...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5 inline-block" />
                Sheets Online
              </span>
            )}
          </div>
        </div>

        {/* User, Shift Controls, Actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap">
          {/* Shift Toggle Buttons */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80">
            <button
              onClick={() => onShiftChange('AM')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                currentShift === 'AM'
                  ? 'bg-white text-[#EE4D2D] shadow-xs border border-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SunMedium className="w-3.5 h-3.5 text-amber-500" />
              AM
            </button>
            <button
              onClick={() => onShiftChange('DDP')}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                currentShift === 'DDP'
                  ? 'bg-white text-[#EE4D2D] shadow-xs border border-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              DDP
            </button>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-2 bg-orange-50/80 border border-orange-200/70 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-[#EE4D2D]" />
            <div className="text-left">
              <span className="text-xs font-bold text-gray-900 block leading-none">
                {currentUser}
              </span>
              {isAdmin && (
                <span className="text-[10px] text-[#EE4D2D] font-extrabold uppercase">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Bipe Sonoro Ativado (clique para silenciar)' : 'Bipe Sonoro Desativado (clique para ativar)'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Configurações do Sistema"
            className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Admin Clean history button */}
          {isAdmin && onOpenAdminClear && (
            <button
              onClick={onOpenAdminClear}
              title="Limpar Registros (Área Restrita)"
              className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={onLogout}
            title="Trocar de Colaborador / Encerrar Turno"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
