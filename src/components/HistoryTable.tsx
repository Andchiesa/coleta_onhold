import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  FileSpreadsheet,
  Copy,
  Trash2,
  Filter,
  Check,
  Calendar,
  Layers,
  ArrowUpDown,
  FileDown,
} from 'lucide-react';
import { ScanRecord, ScanStatus, ShiftType, STATUS_CONFIG } from '../types';
import { exportToCSV, exportToExcel, copyCodesToClipboard } from '../utils/export';

interface HistoryTableProps {
  records: ScanRecord[];
  onDeleteRecord: (id: string) => void;
  currentUser: string;
  isAdmin: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  onDeleteRecord,
  currentUser,
  isAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  // Status metrics
  const metrics = useMemo(() => {
    const total = records.length;
    const byStatus: Record<string, number> = {};
    records.forEach((r) => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });
    return { total, byStatus };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    let list = records.filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.subStatus && r.subStatus.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchShift = shiftFilter === 'ALL' || r.shift === shiftFilter;

      return matchSearch && matchStatus && matchShift;
    });

    if (!sortDesc) {
      list = [...list].reverse();
    }
    return list;
  }, [records, searchTerm, statusFilter, shiftFilter, sortDesc]);

  const handleCopy = async () => {
    if (filteredRecords.length === 0) return;
    await copyCodesToClipboard(filteredRecords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const filename = `LRJ07_Onhold_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCSV(filteredRecords, filename);
  };

  const handleExportExcel = () => {
    const filename = `LRJ07_Onhold_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportToExcel(filteredRecords, filename);
  };

  const allStatuses: ScanStatus[] = [
    'SOC',
    'Roteirizar',
    'Avariado',
    'Volumoso',
    'Item Voando',
    'Duplicidade',
    'Interceptado',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden flex flex-col transition-all">
      {/* Metric summary banner */}
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/70 to-white">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              Histórico de Bipagens
            </h2>
            <span className="bg-[#EE4D2D] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {records.length} total
            </span>
          </div>

          {/* Export and Copy Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer"
              title="Copiar lista de códigos filtrados"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Códigos'}
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer"
              title="Exportar planilha CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              CSV
            </button>

            <button
              onClick={handleExportExcel}
              disabled={filteredRecords.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-40 cursor-pointer"
              title="Exportar pasta de trabalho Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Quick status pills count */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-[10px] font-bold uppercase block opacity-70">Todos</span>
            <span className="text-base font-extrabold">{metrics.total}</span>
          </button>

          {allStatuses.map((st) => {
            const count = metrics.byStatus[st] || 0;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(isSelected ? 'ALL' : st)}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EE4D2D] text-white border-[#EE4D2D] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-[10px] font-bold uppercase block opacity-70 truncate">{st}</span>
                <span className="text-base font-extrabold">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3 justify-between bg-gray-50/40">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, usuário ou detalhe..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Shift selector filter */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-0.5 text-xs font-bold">
            <button
              onClick={() => setShiftFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                shiftFilter === 'ALL' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todos Turnos
            </button>
            <button
              onClick={() => setShiftFilter('AM')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                shiftFilter === 'AM' ? 'bg-[#EE4D2D] text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AM
            </button>
            <button
              onClick={() => setShiftFilter('DDP')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                shiftFilter === 'DDP' ? 'bg-[#EE4D2D] text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              DDP
            </button>
          </div>

          {/* Sort button */}
          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
            title="Alternar ordem de exibição"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sortDesc ? 'Mais recentes' : 'Mais antigos'}</span>
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-3">Hora</th>
              <th className="py-3 px-3">Turno</th>
              <th className="py-3 px-4">Código (Pedido)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Detalhes</th>
              <th className="py-3 px-4">Colaborador</th>
              <th className="py-3 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                  {records.length === 0
                    ? 'Nenhum registro no momento. Faça a primeira bipagem no painel acima!'
                    : 'Nenhum registro encontrado com os filtros selecionados.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const dateObj = new Date(rec.timestamp);
                const dateStr = isNaN(dateObj.getTime())
                  ? '-'
                  : dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const timeStr = isNaN(dateObj.getTime())
                  ? '-'
                  : dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                const conf = STATUS_CONFIG[rec.status] || {
                  badgeBg: 'bg-gray-100 text-gray-800 border-gray-200',
                  label: rec.status,
                };

                return (
                  <tr key={rec.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {dateStr}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {timeStr}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {rec.shift || 'AM'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-gray-900 tracking-wider">
                      {rec.code}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${conf.badgeBg}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 text-xs">
                      {rec.subStatus ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          {rec.subStatus}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-700 font-medium">
                      {rec.user}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="opacity-60 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer"
                        title="Excluir este registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
