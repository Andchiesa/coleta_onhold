import * as XLSX from 'xlsx';
import { ScanRecord } from '../types';

export function exportToCSV(records: ScanRecord[], filename = 'recebimento_onhold_lrj07.csv') {
  if (records.length === 0) return;

  const headers = ['Data', 'Hora', 'Turno', 'Código (Pedido)', 'Status', 'Detalhe / Sub-Status', 'Colaborador'];

  const rows = records.map((r) => {
    const d = new Date(r.timestamp);
    const dateStr = d.toLocaleDateString('pt-BR');
    const timeStr = d.toLocaleTimeString('pt-BR');
    return [
      dateStr,
      timeStr,
      r.shift || 'AM',
      `="${r.code}"`, // Force text formatting in Excel
      r.status,
      r.subStatus || '',
      r.user,
    ];
  });

  // Use semicolon delimiter for PT-BR Excel compatibility, plus UTF-8 BOM
  const csvContent =
    '\uFEFF' +
    [headers.join(';'), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))].join(
      '\r\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(records: ScanRecord[], filename = 'recebimento_onhold_lrj07.xlsx') {
  if (records.length === 0) return;

  const data = records.map((r) => {
    const d = new Date(r.timestamp);
    return {
      Data: d.toLocaleDateString('pt-BR'),
      Hora: d.toLocaleTimeString('pt-BR'),
      Turno: r.shift || 'AM',
      'Código / Pedido': r.code,
      Status: r.status,
      'Detalhe (Sub-Status)': r.subStatus || '',
      Colaborador: r.user,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 12 }, // Data
    { wch: 10 }, // Hora
    { wch: 8 },  // Turno
    { wch: 20 }, // Código
    { wch: 16 }, // Status
    { wch: 22 }, // Detalhe
    { wch: 20 }, // Colaborador
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros LRJ07');

  XLSX.writeFile(workbook, filename);
}

export function copyCodesToClipboard(records: ScanRecord[]): Promise<void> {
  const text = records.map((r) => r.code).join('\n');
  return navigator.clipboard.writeText(text);
}
