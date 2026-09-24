import React, { useState } from 'react';
import { LogIn, User, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { ShiftType } from '../types';

interface LoginScreenProps {
  onLogin: (username: string, shift: ShiftType) => void;
  recentUsers: string[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, recentUsers }) => {
  const [username, setUsername] = useState('');
  const [shift, setShift] = useState<ShiftType>('AM');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim();
    if (!clean) {
      setError('Por favor, informe seu nome para iniciar o turno.');
      return;
    }
    setError('');
    onLogin(clean, shift);
  };

  const handleQuickSelect = (name: string) => {
    setUsername(name);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#F5F5F7] via-[#FFF5F2] to-[#FFEBE5]">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#EE4D2D]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-orange-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EE4D2D] to-[#D03E1F] text-white shadow-lg shadow-[#EE4D2D]/30 mb-4 ring-4 ring-orange-100">
            <span className="text-2xl font-black tracking-wider">SPX</span>
          </div>
          <div className="inline-block bg-orange-100/80 text-[#EE4D2D] text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
            Hub LRJ07
          </div>
          <h1 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
            Recebimento Onhold
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistema de Bipagem e Registro de Coletas
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Nome do Colaborador
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ex: Anderson Chiesa"
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent focus:bg-white transition-all text-sm sm:text-base shadow-sm"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600 font-semibold mt-1.5 animate-fadeIn">
                {error}
              </p>
            )}
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Turno de Operação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShift('AM')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  shift === 'AM'
                    ? 'bg-[#EE4D2D] text-white border-[#EE4D2D] shadow-md shadow-[#EE4D2D]/25 ring-2 ring-[#EE4D2D]/20'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                Turno AM (Manhã)
              </button>
              <button
                type="button"
                onClick={() => setShift('DDP')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  shift === 'DDP'
                    ? 'bg-[#EE4D2D] text-white border-[#EE4D2D] shadow-md shadow-[#EE4D2D]/25 ring-2 ring-[#EE4D2D]/20'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                Turno DDP (Tarde/Noite)
              </button>
            </div>
          </div>

          {/* Quick select users if any */}
          {recentUsers && recentUsers.length > 0 && (
            <div className="pt-1">
              <span className="text-xs text-gray-500 font-medium block mb-2">
                Acessos recentes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentUsers.slice(0, 4).map((user) => (
                  <button
                    key={user}
                    type="button"
                    onClick={() => handleQuickSelect(user)}
                    className="text-xs bg-gray-100 hover:bg-orange-50 hover:text-[#EE4D2D] hover:border-orange-200 border border-transparent text-gray-700 font-medium px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-[#EE4D2D]" />
                    {user}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Shift Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#EE4D2D] to-[#D03E1F] hover:from-[#E03D1D] hover:to-[#B83418] text-white font-bold text-base shadow-lg shadow-[#EE4D2D]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <LogIn className="w-5 h-5" />
            Iniciar Turno
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Armazenamento Local & Google Sheets
          </span>
          <span className="font-mono font-medium">v2.1 • LRJ07</span>
        </div>
      </div>
    </div>
  );
};
