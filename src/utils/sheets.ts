import { ScanRecord } from '../types';

export const DEFAULT_GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxrbIJy6E_tGucbkFLVGXaHGis8KZZf8y6gRij6Kckz3QBd60R4Vyz6_4pLFxOHWhvR/exec';

export async function sendScanToSheets(
  record: ScanRecord,
  scriptUrl: string = DEFAULT_GOOGLE_SCRIPT_URL
): Promise<boolean> {
  if (!scriptUrl || scriptUrl.trim().length === 0) {
    return false;
  }

  try {
    const dateObj = new Date(record.timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
    const dateFormatted = `${day}/${month}/${year}`;

    const responsavel = `${record.shift || 'AM'} ${record.user.toUpperCase()} ${dateFormatted}`;
    const hora = dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const payload = {
      responsavel,
      pedido: record.code,
      roteirizar: record.status,
      detalhe: record.subStatus || '',
      hora,
    };

    const fetchMethod = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : (typeof fetch !== 'undefined' ? fetch : null);

    if (fetchMethod) {
      await fetchMethod(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return true;
    }

    return false;
  } catch (err) {
    console.debug('Failed to send to Google Sheets:', err);
    return false;
  }
}

export async function sendBatchToSheets(
  records: ScanRecord[],
  scriptUrl: string = DEFAULT_GOOGLE_SCRIPT_URL,
  onProgress?: (completed: number, total: number) => void
): Promise<number> {
  let successCount = 0;
  for (let i = 0; i < records.length; i++) {
    const success = await sendScanToSheets(records[i], scriptUrl);
    if (success) successCount++;
    if (onProgress) {
      onProgress(i + 1, records.length);
    }
  }
  return successCount;
}
