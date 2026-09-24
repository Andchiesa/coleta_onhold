import React, { useState, useEffect, useRef } from 'react';
import { sendScanToSheets, DEFAULT_GOOGLE_SCRIPT_URL } from './utils/sheets';
import { playSuccessBeep, playErrorBeep, playBatchBeep } from './utils/audio';
import { exportToExcel, exportToCSV } from './utils/export';

interface ScanItem {
  id: string;
  timestamp: string;
  shift: string;
  code: string;
  status: string;
  subStatus: string;
  user: string;
}

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('logistics_user') || '';
  });
  const [usernameInput, setUsernameInput] = useState('');

  // Switch User Modal State (change operator while keeping scans intact)
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');

  // Shift state: 'AM' | 'DDP'
  const [currentShift, setCurrentShift] = useState<string>(() => {
    return localStorage.getItem('logistics_shift') || 'AM';
  });

  // Mode tab: 'single' | 'batch'
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single scan state
  const [scanInput, setScanInput] = useState('');
  const [validationMsg, setValidationMsg] = useState('');
  const [isInputError, setIsInputError] = useState(false);
  const singleInputRef = useRef<HTMLInputElement>(null);
  const switchUserInputRef = useRef<HTMLInputElement>(null);

  // Batch scan state
  const [batchInput, setBatchInput] = useState('');

  // History state (saved in localStorage so it is NEVER lost on user switch)
  const [scans, setScans] = useState<ScanItem[]>(() => {
    try {
      const saved = localStorage.getItem('logistics_scans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal & Error state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSingleCode, setTempSingleCode] = useState('');
  const [pendingBatch, setPendingBatch] = useState<{ codes: string[]; status: string } | null>(null);
  const [errorPopupMsg, setErrorPopupMsg] = useState<string | null>(null);

  // Focus single input when in single mode or user logs in
  useEffect(() => {
    if (currentUser && activeTab === 'single' && !isModalOpen && !isSwitchUserOpen) {
      singleInputRef.current?.focus();
    }
  }, [currentUser, activeTab, isModalOpen, isSwitchUserOpen]);

  // Focus input when switch user modal opens
  useEffect(() => {
    if (isSwitchUserOpen) {
      setNewUsernameInput('');
      setTimeout(() => switchUserInputRef.current?.focus(), 80);
    }
  }, [isSwitchUserOpen]);

  // Persist scans
  useEffect(() => {
    localStorage.setItem('logistics_scans', JSON.stringify(scans));
  }, [scans]);

  // Show error popup helper
  const showError = (msg: string) => {
    playErrorBeep();
    setErrorPopupMsg(msg);
    setTimeout(() => {
      setErrorPopupMsg(null);
    }, 3500);
  };

  // Login handler from initial login screen
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = usernameInput.trim();
    if (name) {
      setCurrentUser(name);
      localStorage.setItem('logistics_user', name);
      setUsernameInput('');
    }
  };

  // Switch user while staying on dashboard (keeps all history and scans)
  const handleConfirmSwitchUser = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newUsernameInput.trim();
    if (name) {
      setCurrentUser(name);
      localStorage.setItem('logistics_user', name);
      setIsSwitchUserOpen(false);
      setNewUsernameInput('');
      if (activeTab === 'single') {
        setTimeout(() => singleInputRef.current?.focus(), 80);
      }
    }
  };

  // Logout to login screen (preserves scans in localStorage)
  const handleFullLogout = () => {
    setCurrentUser('');
    localStorage.removeItem('logistics_user');
    setIsSwitchUserOpen(false);
    setUsernameInput('');
    setScanInput('');
    setBatchInput('');
  };

  // Shift toggle
  const handleShiftChange = (shift: string) => {
    setCurrentShift(shift);
    localStorage.setItem('logistics_shift', shift);
  };

  // Add scan record
  const addScanRecord = (code: string, status: string, subStatus: string = '') => {
    const newRecord: ScanItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      shift: currentShift,
      code,
      status,
      subStatus,
      user: currentUser.toUpperCase(),
    };

    setScans((prev) => [newRecord, ...prev]);

    // Send to Google Sheets in background
    sendScanToSheets(
      {
        id: newRecord.id,
        code: newRecord.code,
        status: newRecord.status as any,
        subStatus: newRecord.subStatus,
        timestamp: newRecord.timestamp,
        user: newRecord.user,
        shift: newRecord.shift as any,
      },
      DEFAULT_GOOGLE_SCRIPT_URL
    );
  };

  // Handle single mode status click
  const handleSingleStatusClick = (status: string) => {
    const code = scanInput.trim().toUpperCase();

    if (!code) {
      setIsInputError(true);
      setValidationMsg('Bipe o código de 15 dígitos primeiro!');
      showError('Bipe o código de 15 dígitos primeiro!');
      singleInputRef.current?.focus();
      return;
    }

    if (code.length !== 15) {
      setIsInputError(true);
      setValidationMsg(`O código deve ter exatamente 15 caracteres! (Atual: ${code.length})`);
      showError(`O código deve ter exatamente 15 caracteres! (Atual: ${code.length})`);
      singleInputRef.current?.focus();
      return;
    }

    // Reset validation
    setIsInputError(false);
    setValidationMsg('');

    if (status === 'Volumoso') {
      setTempSingleCode(code);
      setIsModalOpen(true);
    } else {
      addScanRecord(code, status, '');
      playSuccessBeep();
      setScanInput('');
      singleInputRef.current?.focus();
    }
  };

  // Handle single scan input change
  const handleScanInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanInput(e.target.value);
    setIsInputError(false);
    setValidationMsg('');
  };

  // Handle enter key on single scan input
  const handleScanInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = scanInput.trim().toUpperCase();
      if (!code) return;

      if (code.length !== 15) {
        setIsInputError(true);
        setValidationMsg(`O código deve ter exatamente 15 caracteres! (Atual: ${code.length})`);
        showError(`O código deve ter exatamente 15 caracteres! (Atual: ${code.length})`);
      } else {
        setValidationMsg('Selecione o botão de status para registrar.');
      }
    }
  };

  // Handle batch process
  const handleBatchProcess = (status: string) => {
    const text = batchInput.trim();
    if (!text) {
      showError('Insira códigos para processar!');
      return;
    }

    const codes = text
      .split(/[\n\r\s\t,;]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    if (codes.length === 0) {
      showError('Nenhum código válido encontrado!');
      return;
    }

    // Filter valid vs invalid
    const validCodes = codes.filter((c) => c.length === 15);
    const invalidCount = codes.length - validCodes.length;

    if (validCodes.length === 0) {
      showError('Nenhum código possui os 15 dígitos exigidos.');
      return;
    }

    if (status === 'Volumoso') {
      setPendingBatch({ codes: validCodes, status });
      setIsModalOpen(true);
    } else {
      validCodes.forEach((code) => {
        addScanRecord(code, status, '');
      });
      playBatchBeep();
      setBatchInput('');

      if (invalidCount > 0) {
        showError(`${validCodes.length} registrados. ${invalidCount} códigos foram ignorados por não terem 15 dígitos.`);
      }
    }
  };

  // Handle download of scans to Excel / CSV
  const handleDownload = () => {
    if (scans.length === 0) {
      showError('Nenhum registro para exportar.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    exportToExcel(
      scans.map((s) => ({
        id: s.id,
        code: s.code,
        status: s.status as any,
        subStatus: s.subStatus,
        timestamp: s.timestamp,
        user: s.user,
        shift: s.shift as any,
      })),
      `LRJ07_Coletas_Onhold_${today}.xlsx`
    );
  };

  // Handle Volumoso sub-status click
  const handleSubStatusClick = (subStatus: string) => {
    if (tempSingleCode) {
      addScanRecord(tempSingleCode, 'Volumoso', subStatus);
      playSuccessBeep();
      setTempSingleCode('');
      setScanInput('');
      setIsModalOpen(false);
      singleInputRef.current?.focus();
      return;
    }

    if (pendingBatch) {
      pendingBatch.codes.forEach((code) => {
        addScanRecord(code, 'Volumoso', subStatus);
      });
      playBatchBeep();
      setPendingBatch(null);
      setBatchInput('');
      setIsModalOpen(false);
      return;
    }

    setIsModalOpen(false);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTempSingleCode('');
    setPendingBatch(null);
    if (activeTab === 'single') {
      singleInputRef.current?.focus();
    }
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '-';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'SOC':
        return 'badge-soc';
      case 'Roteirizar':
        return 'badge-roteirizar';
      case 'Avariado':
        return 'badge-avariado';
      case 'Volumoso':
        return 'badge-volumoso';
      case 'Item Voando':
        return 'badge-item-voando';
      case 'Duplicidade':
        return 'badge-duplicidade';
      case 'Interceptado':
        return 'badge-interceptado';
      default:
        return '';
    }
  };

  // 1. LOGIN SCREEN
  if (!currentUser) {
    return (
      <div id="app">
        <div id="login-screen" className="screen active">
          <div className="glass-card login-card">
            <img
              src="https://i.imgur.com/b7GK1hW.png"
              alt="Shopee Xpress Logo"
              className="app-logo"
            />
            <h1>Recebimento Onhold - LRJ07</h1>
            <p>Registro de Coletas</p>
            <form onSubmit={handleLogin} className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <div>
                <label htmlFor="username">NOME DO COLABORADOR</label>
                <input
                  type="text"
                  id="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Digite seu nome"
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <button type="submit" id="start-shift-btn" className="btn-primary">
                Iniciar Turno
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD SCREEN
  return (
    <div id="app">
      <div id="dashboard-screen" className="screen">
        {/* Top Header Bar */}
        <header className="top-bar">
          <div className="brand-area">
            <img
              src="https://i.imgur.com/b7GK1hW.png"
              alt="Shopee Xpress Logo"
              className="header-logo"
            />
            <span className="brand-title">Recebimento Onhold - LRJ07</span>
          </div>
          <div className="controls-area">
            <div className="user-info">
              <span
                id="display-username"
                onClick={() => setIsSwitchUserOpen(true)}
                title="Clique para trocar de colaborador"
                style={{ cursor: 'pointer' }}
              >
                {currentUser}
              </span>
              <button
                id="switch-user-btn"
                type="button"
                onClick={() => setIsSwitchUserOpen(true)}
                className="btn-text"
                title="Trocar colaborador e manter histórico"
              >
                Sair
              </button>
            </div>
            <div className="divider"></div>
            <div className="shift-toggle">
              <input
                type="radio"
                name="shift"
                id="shift-am"
                value="AM"
                checked={currentShift === 'AM'}
                onChange={() => handleShiftChange('AM')}
              />
              <label htmlFor="shift-am">AM</label>
              <input
                type="radio"
                name="shift"
                id="shift-ddp"
                value="DDP"
                checked={currentShift === 'DDP'}
                onChange={() => handleShiftChange('DDP')}
              />
              <label htmlFor="shift-ddp">DDP</label>
            </div>
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="main-content">
          {/* Scanner Section (Left Column) */}
          <section className="scanner-section glass-card">
            <div className="tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
                data-tab="single"
                onClick={() => {
                  setActiveTab('single');
                  setTimeout(() => singleInputRef.current?.focus(), 50);
                }}
              >
                Unitário
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
                data-tab="batch"
                onClick={() => setActiveTab('batch')}
              >
                Em Lote
              </button>
            </div>

            {/* Single Scan Mode */}
            {activeTab === 'single' && (
              <div id="single-mode" className="mode-content active">
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="scan-input"
                    ref={singleInputRef}
                    value={scanInput}
                    onChange={handleScanInputChange}
                    onKeyDown={handleScanInputKeyDown}
                    placeholder="Bipe o código (15 dígitos)"
                    maxLength={20}
                    autoFocus
                    style={isInputError ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {validationMsg && (
                    <div id="validation-msg" className="validation-msg">
                      {validationMsg}
                    </div>
                  )}
                </div>

                <div className="status-grid">
                  <button
                    type="button"
                    className="status-btn"
                    data-status="SOC"
                    onClick={() => handleSingleStatusClick('SOC')}
                  >
                    SOC
                  </button>
                  <button
                    type="button"
                    className="status-btn"
                    data-status="Roteirizar"
                    onClick={() => handleSingleStatusClick('Roteirizar')}
                  >
                    Roteirizar
                  </button>
                  <button
                    type="button"
                    className="status-btn"
                    data-status="Avariado"
                    onClick={() => handleSingleStatusClick('Avariado')}
                  >
                    Avariado
                  </button>
                  <button
                    type="button"
                    className="status-btn"
                    data-status="Volumoso"
                    onClick={() => handleSingleStatusClick('Volumoso')}
                  >
                    Volumoso
                  </button>
                  <button
                    type="button"
                    className="status-btn"
                    data-status="Item Voando"
                    onClick={() => handleSingleStatusClick('Item Voando')}
                  >
                    Item Voando
                  </button>
                  <button
                    type="button"
                    className="status-btn"
                    data-status="Duplicidade"
                    onClick={() => handleSingleStatusClick('Duplicidade')}
                  >
                    Duplicidade
                  </button>
                  <button
                    type="button"
                    className="status-btn"
                    data-status="Interceptado"
                    onClick={() => handleSingleStatusClick('Interceptado')}
                  >
                    Interceptado
                  </button>
                </div>
              </div>
            )}

            {/* Batch Scan Mode */}
            {activeTab === 'batch' && (
              <div id="batch-mode" className="mode-content active">
                <div className="batch-container">
                  <textarea
                    id="batch-input"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder="Cole os códigos aqui (um por linha ou separados por espaço)..."
                    autoFocus
                  />
                  <div className="batch-controls">
                    <div className="status-grid">
                      <button
                        type="button"
                        className="status-btn batch-btn"
                        data-status="SOC"
                        onClick={() => handleBatchProcess('SOC')}
                      >
                        SOC
                      </button>
                      <button
                        type="button"
                        className="status-btn batch-btn"
                        data-status="Roteirizar"
                        onClick={() => handleBatchProcess('Roteirizar')}
                      >
                        Roteirizar
                      </button>
                      <button
                        type="button"
                        className="status-btn batch-btn"
                        data-status="Avariado"
                        onClick={() => handleBatchProcess('Avariado')}
                      >
                        Avariado
                      </button>
                      <button
                        type="button"
                        className="status-btn batch-btn"
                        data-status="Volumoso"
                        onClick={() => handleBatchProcess('Volumoso')}
                      >
                        Volumoso
                      </button>
                      <button
                        type="button"
                        className="status-btn batch-btn"
                        data-status="Item Voando"
                        onClick={() => handleBatchProcess('Item Voando')}
                      >
                        Item Voando
                      </button>
                      <button
                        type="button"
                        className="status-btn batch-btn"
                        data-status="Duplicidade"
                        onClick={() => handleBatchProcess('Duplicidade')}
                      >
                        Duplicidade
                      </button>
                      <button
                        type="button"
                        className="status-btn batch-btn"
                        data-status="Interceptado"
                        onClick={() => handleBatchProcess('Interceptado')}
                      >
                        Interceptado
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* History Section (Right Column) */}
          <section className="history-section glass-card">
            <div className="section-header">
              <h2>Últimos Registros</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn-download"
                  onClick={handleDownload}
                  disabled={scans.length === 0}
                  title="Baixar planilha Excel com as coletas registradas"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Baixar Coletas</span>
                </button>
                <span className="badge-count" id="record-count">
                  {scans.length} registros
                </span>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Turno</th>
                    <th>Código</th>
                    <th>Status</th>
                    <th>Detalhe</th>
                    <th>Usuário</th>
                  </tr>
                </thead>
                <tbody id="history-table-body">
                  {scans.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                        Nenhum registro no momento.
                      </td>
                    </tr>
                  ) : (
                    scans.map((scan) => (
                      <tr key={scan.id}>
                        <td>{formatDate(scan.timestamp)}</td>
                        <td>{formatTime(scan.timestamp)}</td>
                        <td>{scan.shift || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{scan.code}</td>
                        <td>
                          <span className={`badge ${getBadgeClass(scan.status)}`}>
                            {scan.status}
                          </span>
                        </td>
                        <td>{scan.subStatus || '-'}</td>
                        <td>{scan.user}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Switch User Modal (Trocar Usuário mantendo histórico) */}
      {isSwitchUserOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px' }}>
            <h3>Trocar Colaborador</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Os registros lançados permanecerão salvos no histórico.
            </p>
            <form onSubmit={handleConfirmSwitchUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div className="input-group">
                <label htmlFor="new-username" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  NOVO COLABORADOR
                </label>
                <input
                  ref={switchUserInputRef}
                  type="text"
                  id="new-username"
                  value={newUsernameInput}
                  onChange={(e) => setNewUsernameInput(e.target.value)}
                  placeholder="Digite o novo nome..."
                  autoComplete="off"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={!newUsernameInput.trim()}
                  className="btn-primary"
                  style={{ opacity: newUsernameInput.trim() ? 1 : 0.5 }}
                >
                  Confirmar e Continuar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setIsSwitchUserOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-text"
                  style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: 'var(--text-secondary)' }}
                  onClick={handleFullLogout}
                >
                  Encerrar sessão completa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volumoso Sub-Status Modal */}
      {isModalOpen && (
        <div id="volumoso-modal" className="modal-overlay">
          <div className="modal-content">
            <h3>Selecione o Detalhe</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Classificação adicional para item Volumoso
            </p>
            <div className="modal-options">
              <button
                type="button"
                className="sub-status-btn"
                data-sub="Caixa Grande"
                onClick={() => handleSubStatusClick('Caixa Grande')}
              >
                Caixa Grande
              </button>
              <button
                type="button"
                className="sub-status-btn"
                data-sub="Saco Grande"
                onClick={() => handleSubStatusClick('Saco Grande')}
              >
                Saco Grande
              </button>
              <button
                type="button"
                className="sub-status-btn"
                data-sub="Peso Elevado"
                onClick={() => handleSubStatusClick('Peso Elevado')}
              >
                Peso Elevado
              </button>
              <button
                type="button"
                className="sub-status-btn"
                data-sub="Formato Irregular"
                onClick={() => handleSubStatusClick('Formato Irregular')}
              >
                Formato Irregular
              </button>
              <button
                type="button"
                className="sub-status-btn"
                data-sub="Pacote Longo"
                onClick={() => handleSubStatusClick('Pacote Longo')}
              >
                Pacote Longo
              </button>
              <button
                type="button"
                className="sub-status-btn"
                data-sub="Outro"
                onClick={() => handleSubStatusClick('Outro')}
              >
                Outro
              </button>
            </div>
            <button
              type="button"
              id="cancel-modal-btn"
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleCloseModal}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Error Popup Notification */}
      {errorPopupMsg && (
        <div id="error-popup" className="popup">
          <div className="popup-content error">
            <span id="error-text">{errorPopupMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
