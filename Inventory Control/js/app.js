// State Management
const state = {
    currentUser: localStorage.getItem('logistics_user') || '',
    currentShift: localStorage.getItem('logistics_shift') || 'AM',
    scans: JSON.parse(localStorage.getItem('logistics_scans')) || [],
    tempScanCode: '', // Used when waiting for Volumoso sub-status (Single)
    pendingBatch: null // { codes: [], status: '' } Used for Batch Volumoso
};

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    loginScreen: document.getElementById('login-screen'),
    dashboardScreen: document.getElementById('dashboard-screen'),
    usernameInput: document.getElementById('username'),
    startShiftBtn: document.getElementById('start-shift-btn'),
    displayUsername: document.getElementById('display-username'),
    switchUserBtn: document.getElementById('switch-user-btn'),
    shiftRadios: document.getElementsByName('shift'),
    scanInput: document.getElementById('scan-input'),
    validationMsg: document.getElementById('validation-msg'),
    statusBtns: document.querySelectorAll('.status-btn:not(.batch-btn)'), // Single mode buttons
    historyTableBody: document.getElementById('history-table-body'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    singleMode: document.getElementById('single-mode'),
    batchMode: document.getElementById('batch-mode'),
    batchInput: document.getElementById('batch-input'),
    batchBtns: document.querySelectorAll('.batch-btn'), // Batch mode buttons
    volumosoModal: document.getElementById('volumoso-modal'),
    subStatusBtns: document.querySelectorAll('.sub-status-btn'),
    cancelModalBtn: document.getElementById('cancel-modal-btn'),
    errorPopup: document.getElementById('error-popup'),
    errorText: document.getElementById('error-text'),
    exportBtn: document.getElementById('export-btn')
};

// Initialization
function init() {
    setupEventListeners();
    render();
}

// Event Listeners
function setupEventListeners() {
    // Login
    elements.startShiftBtn.addEventListener('click', handleLogin);
    elements.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Dashboard Controls
    elements.switchUserBtn.addEventListener('click', switchUser);
    elements.shiftRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.currentShift = e.target.value;
            localStorage.setItem('logistics_shift', state.currentShift);
        });
    });

    // Tabs
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.dataset.tab;
            if (mode === 'single') {
                elements.singleMode.classList.remove('hidden');
                elements.batchMode.classList.add('hidden');
                elements.scanInput.focus();
            } else {
                elements.singleMode.classList.add('hidden');
                elements.batchMode.classList.remove('hidden');
                elements.batchInput.focus();
            }
        });
    });

    // Single Scan
    elements.scanInput.addEventListener('input', validateInput);
    elements.statusBtns.forEach(btn => {
        btn.addEventListener('click', () => handleStatusClick(btn.dataset.status));
    });

    // Batch Scan Buttons
    elements.batchBtns.forEach(btn => {
        btn.addEventListener('click', () => handleBatchProcess(btn.dataset.status));
    });

    // Volumoso Modal
    elements.subStatusBtns.forEach(btn => {
        btn.addEventListener('click', () => handleSubStatusClick(btn.dataset.sub));
    });
    elements.cancelModalBtn.addEventListener('click', closeModal);

    // Export
    elements.exportBtn.addEventListener('click', () => exportToCSV(state.scans));
}

// Logic Functions
function handleLogin() {
    const name = elements.usernameInput.value.trim();
    if (name) {
        state.currentUser = name;
        localStorage.setItem('logistics_user', name);
        render();
    }
}

function switchUser() {
    state.currentUser = '';
    localStorage.removeItem('logistics_user');
    elements.usernameInput.value = '';
    render();
}

function validateInput() {
    const code = elements.scanInput.value.trim();
    // Reset validation state
    elements.scanInput.style.borderColor = 'var(--glass-border)';
    elements.validationMsg.classList.add('hidden');
}

function handleStatusClick(status) {
    const code = elements.scanInput.value.trim();

    if (code.length !== 15) {
        showError('O código deve ter exatamente 15 caracteres!');
        elements.scanInput.style.borderColor = 'var(--danger)';
        return;
    }

    if (status === 'Volumoso') {
        state.tempScanCode = code;
        openModal();
    } else {
        addScan(code, status);
        resetScanner();
    }
}

function handleSubStatusClick(subStatus) {
    // Handle Single Scan Volumoso
    if (state.tempScanCode) {
        addScan(state.tempScanCode, 'Volumoso', subStatus);
        state.tempScanCode = '';
        closeModal();
        resetScanner();
        return;
    }

    // Handle Batch Scan Volumoso
    if (state.pendingBatch) {
        processBatchCodes(state.pendingBatch.codes, 'Volumoso', subStatus);
        state.pendingBatch = null;
        closeModal();
        elements.batchInput.value = ''; // Clear input after success
        return;
    }
}

function handleBatchProcess(status) {
    const text = elements.batchInput.value;

    if (!status) {
        showError('Status inválido!');
        return;
    }

    if (!text.trim()) {
        showError('Insira códigos para processar!');
        return;
    }

    // Split by newlines or spaces/tabs
    const codes = text.split(/[\n\s]+/).filter(c => c.trim().length > 0);

    if (codes.length === 0) {
        showError('Nenhum código válido encontrado!');
        return;
    }

    if (status === 'Volumoso') {
        // Open modal to select sub-status for the entire batch
        state.pendingBatch = { codes, status };
        openModal();
    } else {
        // Process immediately for other statuses
        processBatchCodes(codes, status);
        elements.batchInput.value = '';
    }
}

function processBatchCodes(codes, status, subStatus = '') {
    let addedCount = 0;
    let errorCount = 0;

    codes.forEach(code => {
        // Clean the code (remove hidden characters)
        const cleanCode = code.trim();

        if (cleanCode.length === 15) {
            addScan(cleanCode, status, subStatus);
            addedCount++;
        } else {
            errorCount++;
        }
    });

    if (errorCount > 0) {
        showError(`${errorCount} códigos inválidos (devem ter 15 dígitos).`);
    } else {
        // Success feedback if all good
        // Optional: show a small toast or just update table
    }

    renderHistory();
}

function addScan(code, status, subStatus = '') {
    const newScan = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        user: state.currentUser,
        timestamp: new Date().toISOString(),
        shift: state.currentShift,
        code: code,
        status: status,
        subStatus: subStatus
    };

    state.scans.unshift(newScan); // Add to top
    localStorage.setItem('logistics_scans', JSON.stringify(state.scans));
    renderHistory();
}

function resetScanner() {
    elements.scanInput.value = '';
    elements.scanInput.focus();
}

function showError(msg) {
    elements.errorText.textContent = msg;
    elements.errorPopup.classList.remove('hidden');
    setTimeout(() => {
        elements.errorPopup.classList.add('hidden');
    }, 3000);
}

function openModal() {
    elements.volumosoModal.classList.remove('hidden');
}

function closeModal() {
    elements.volumosoModal.classList.add('hidden');
    state.tempScanCode = '';
    state.pendingBatch = null;
}

// Export Function
async function exportToCSV(data) {
    if (!data || data.length === 0) {
        alert("Nenhum dado para exportar!");
        return;
    }

    // Define headers
    const headers = ["ID", "Usuário", "Data/Hora", "Turno", "Código", "Status", "Detalhe"];

    // Convert data to CSV rows
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => {
            const date = new Date(row.timestamp).toLocaleString('pt-BR');
            // Escape fields that might contain commas
            const escape = (field) => `"${String(field || '').replace(/"/g, '""')}"`;

            return [
                escape(row.id),
                escape(row.user),
                escape(date),
                escape(row.shift),
                escape(row.code),
                escape(row.status),
                escape(row.subStatus)
            ].join(',');
        })
    ];

    const csvString = csvRows.join('\n');
    const bom = "\uFEFF";
    const csvContent = bom + csvString;

    // Try Modern File System Access API (Chrome/Edge)
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: `coleta_logistica_${new Date().toISOString().slice(0, 10)}.csv`,
                types: [{
                    description: 'CSV File',
                    accept: { 'text/csv': ['.csv'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(csvContent);
            await writable.close();
            return;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Export failed:', err);
                // Fallback will run if this fails
            } else {
                return; // User cancelled
            }
        }
    }

    // Fallback for other browsers or if API fails
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `coleta_logistica_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Render Functions
function render() {
    if (state.currentUser) {
        elements.loginScreen.classList.remove('active');
        elements.loginScreen.classList.add('hidden');
        elements.dashboardScreen.classList.remove('hidden');
        elements.displayUsername.textContent = state.currentUser;

        // Set radio
        if (state.currentShift === 'AM') elements.shiftRadios[0].checked = true;
        else elements.shiftRadios[1].checked = true;

        renderHistory();
        setTimeout(() => elements.scanInput.focus(), 100);
    } else {
        elements.loginScreen.classList.add('active');
        elements.loginScreen.classList.remove('hidden');
        elements.dashboardScreen.classList.add('hidden');
    }
}

function renderHistory() {
    elements.historyTableBody.innerHTML = '';

    // Update record count
    const countElement = document.getElementById('record-count');
    if (countElement) {
        countElement.textContent = `${state.scans.length} registros`;
    }
    try {
        // Show top 50 for performance
        state.scans.slice(0, 50).forEach(scan => {
            let dateStr = '-';
            let timeStr = '-';

            if (scan.timestamp) {
                try {
                    const dateObj = new Date(scan.timestamp);
                    dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                } catch (e) {
                    console.error('Invalid date', scan.timestamp);
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${timeStr}</td>
                <td>${scan.shift || '-'}</td>
                <td>${scan.code}</td>
                <td><span class="badge badge-${scan.status.toLowerCase().replace(' ', '-')}">${scan.status}</span></td>
                <td>${scan.subStatus || '-'}</td>
                <td>${scan.user}</td>
            `;
            elements.historyTableBody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error rendering history:', err);
        elements.historyTableBody.innerHTML = '<tr><td colspan="7">Erro ao carregar histórico. Tente limpar os dados.</td></tr>';
    }
}

// Start
init();
