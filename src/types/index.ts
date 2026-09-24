export type ScanStatus =
  | 'SOC'
  | 'Roteirizar'
  | 'Avariado'
  | 'Volumoso'
  | 'Item Voando'
  | 'Duplicidade'
  | 'Interceptado';

export type VolumosoSubStatus =
  | 'Caixa Grande'
  | 'Saco Grande'
  | 'Peso Elevado'
  | 'Formato Irregular'
  | 'Pacote Longo'
  | 'Outro';

export type ShiftType = 'AM' | 'DDP' | 'PM';

export interface ScanRecord {
  id: string;
  code: string;
  status: ScanStatus;
  subStatus?: string;
  timestamp: string; // ISO string
  user: string;
  shift: ShiftType;
  syncedToSheets?: boolean;
}

export interface AppConfig {
  googleScriptUrl: string;
  codeLength: number;
  soundEnabled: boolean;
  autoSendToSheets: boolean;
  adminUsers: string[];
}

export const STATUS_CONFIG: Record<
  ScanStatus,
  {
    label: string;
    color: string;
    borderLeftColor: string;
    badgeBg: string;
    badgeText: string;
    iconName: string;
    description: string;
  }
> = {
  SOC: {
    label: 'SOC',
    color: 'bg-blue-600',
    borderLeftColor: 'border-l-blue-500',
    badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
    badgeText: 'text-blue-700',
    iconName: 'ShieldAlert',
    description: 'Solicitação de Ordem de Coleta / Onhold',
  },
  Roteirizar: {
    label: 'Roteirizar',
    color: 'bg-indigo-600',
    borderLeftColor: 'border-l-indigo-500',
    badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    badgeText: 'text-indigo-700',
    iconName: 'Route',
    description: 'Encaminhar para nova rota de entrega',
  },
  Avariado: {
    label: 'Avariado',
    color: 'bg-red-600',
    borderLeftColor: 'border-l-red-500',
    badgeBg: 'bg-red-50 text-red-700 border border-red-200',
    badgeText: 'text-red-700',
    iconName: 'AlertTriangle',
    description: 'Pacote danificado ou violado',
  },
  Volumoso: {
    label: 'Volumoso',
    color: 'bg-amber-500',
    borderLeftColor: 'border-l-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200',
    badgeText: 'text-amber-700',
    iconName: 'Package',
    description: 'Dimensões ou peso fora do padrão',
  },
  'Item Voando': {
    label: 'Item Voando',
    color: 'bg-purple-600',
    borderLeftColor: 'border-l-purple-500',
    badgeBg: 'bg-purple-50 text-purple-700 border border-purple-200',
    badgeText: 'text-purple-700',
    iconName: 'Wind',
    description: 'Item extraviado ou sem amarração',
  },
  Duplicidade: {
    label: 'Duplicidade',
    color: 'bg-rose-600',
    borderLeftColor: 'border-l-rose-500',
    badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200',
    badgeText: 'text-rose-700',
    iconName: 'Copy',
    description: 'Código já bipado ou duplicado',
  },
  Interceptado: {
    label: 'Interceptado',
    color: 'bg-zinc-600',
    borderLeftColor: 'border-l-zinc-500',
    badgeBg: 'bg-zinc-100 text-zinc-700 border border-zinc-300',
    badgeText: 'text-zinc-700',
    iconName: 'Ban',
    description: 'Pacote bloqueado / cancelado pelo sistema',
  },
};
