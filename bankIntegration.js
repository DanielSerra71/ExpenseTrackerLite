import bankApiService from './bankApiService.js';

class BankIntegration {
    constructor() {
        this.connectedBanks = [];
        this.init();
    }

    init() {
        console.log('BankIntegration initialized');
        this.loadConnectedBanks();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('bankConnectionForm');
        console.log('Setting up event listeners', form);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            
            if (!window.currentUser) {
                window.showNotification('Error', 'Please login first', 'error');
                return;
            }

            const bankName = document.getElementById('bankSelect').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            console.log('Attempting to connect to bank:', bankName);

            try {
                const result = await this.connectBank(bankName, { username, password });
                console.log('Connection result:', result);
                this.updateBanksList();
                window.showNotification('Success', 'Bank connected successfully', 'success');
                form.reset();
            } catch (error) {
                console.error('Connection error:', error);
                window.showNotification('Error', error.message, 'error');
            }
        });
    }

    async connectBank(bankName, credentials) {
        try {
            const connection = await bankApiService.connectToBank(bankName, credentials);
            
            if (connection.success) {
                this.connectedBanks.push({
                    id: connection.bankId,
                    name: bankName,
                    accounts: connection.accounts,
                    lastSync: new Date().toISOString()
                });

                this.saveConnectedBanks();
                return connection;
            }
        } catch (error) {
            throw new Error('Connection failed: ' + error.message);
        }
    }

    loadConnectedBanks() {
        if (window.currentUser) {
            const saved = localStorage.getItem(`banks_${window.currentUser.id}`);
            this.connectedBanks = saved ? JSON.parse(saved) : [];
            this.updateBanksList();
        }
    }

    saveConnectedBanks() {
        if (window.currentUser) {
            localStorage.setItem(
                `banks_${window.currentUser.id}`, 
                JSON.stringify(this.connectedBanks)
            );
        }
    }

    updateBanksList() {
        const banksList = document.getElementById('banksList');
        banksList.innerHTML = '';

        this.connectedBanks.forEach(bank => {
            const bankElement = document.createElement('div');
            bankElement.className = 'bank-card';
            
            // Crear lista de cuentas con botón para ver transacciones
            const accountsList = bank.accounts.map(account => `
                <div class="account-item">
                    <div class="account-info">
                        <span class="account-name">${account.name}</span>
                        <span class="account-type">${account.type}</span>
                    </div>
                    <div class="account-actions">
                        <span class="account-balance ${account.balance >= 0 ? 'positive' : 'negative'}">
                            $${Math.abs(account.balance).toFixed(2)}
                        </span>
                        <button onclick="bankIntegration.viewTransactions('${bank.id}', '${account.id}')" class="btn-icon">
                            <i class="fas fa-list"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            bankElement.innerHTML = `
                <div class="bank-info">
                    <i class="fas fa-university"></i>
                    <div>
                        <h4>${bank.name}</h4>
                        <small>Last sync: ${new Date(bank.lastSync).toLocaleString()}</small>
                    </div>
                </div>
                <div class="accounts-list">
                    ${accountsList}
                </div>
                <div class="bank-actions">
                    <button onclick="bankIntegration.syncBank('${bank.id}')" class="btn-icon">
                        <i class="fas fa-sync"></i>
                    </button>
                    <button onclick="bankIntegration.disconnectBank('${bank.id}')" class="btn-icon">
                        <i class="fas fa-unlink"></i>
                    </button>
                </div>
            `;
            banksList.appendChild(bankElement);
        });

        // Agregar modal para transacciones
        if (!document.getElementById('transactionsModal')) {
            const modal = document.createElement('div');
            modal.id = 'transactionsModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Account Transactions</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="transactions-list"></div>
                </div>
            `;
            document.body.appendChild(modal);

            // Cerrar modal
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    async syncBank(bankId) {
        try {
            const bank = this.connectedBanks.find(b => b.id === bankId);
            if (!bank) throw new Error('Bank not found');

            // Simular sincronización
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            bank.lastSync = new Date().toISOString();
            this.saveConnectedBanks();
            this.updateBanksList();
            
            window.showNotification('Success', 'Bank synced successfully', 'success');
        } catch (error) {
            window.showNotification('Error', error.message, 'error');
        }
    }

    disconnectBank(bankId) {
        const index = this.connectedBanks.findIndex(b => b.id === bankId);
        if (index !== -1) {
            this.connectedBanks.splice(index, 1);
            this.saveConnectedBanks();
            this.updateBanksList();
            window.showNotification('Success', 'Bank disconnected successfully', 'success');
        }
    }

    async viewTransactions(bankId, accountId) {
        const modal = document.getElementById('transactionsModal');
        const transactionsList = modal.querySelector('.transactions-list');
        modal.style.display = 'block';

        try {
            const bank = this.connectedBanks.find(b => b.id === bankId);
            const account = bank.accounts.find(a => a.id === accountId);
            const transactions = await bankApiService.getTransactions(bankId, accountId);

            transactionsList.innerHTML = `
                <div class="account-header">
                    <h4>${account.name}</h4>
                    <span class="balance ${account.balance >= 0 ? 'positive' : 'negative'}">
                        Balance: $${Math.abs(account.balance).toFixed(2)}
                    </span>
                </div>
                <div class="transactions-container">
                    ${transactions.map(t => `
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <span class="date">${new Date(t.date).toLocaleDateString()}</span>
                                <span class="description">${t.description}</span>
                                <span class="category">${t.category}</span>
                            </div>
                            <div class="transaction-actions">
                                <span class="amount ${t.amount >= 0 ? 'positive' : 'negative'}">
                                    ${t.amount >= 0 ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}
                                </span>
                                <button onclick="bankIntegration.importTransaction('${t.id}', '${bankId}', '${accountId}')" class="btn-icon">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Error loading transactions:', error);
            window.showNotification('Error', 'Failed to load transactions', 'error');
        }
    }

    async importTransaction(transactionId, bankId, accountId) {
        try {
            const bank = this.connectedBanks.find(b => b.id === bankId);
            const account = bank.accounts.find(a => a.id === accountId);
            const transactions = await bankApiService.getTransactions(bankId, accountId);
            const transaction = transactions.find(t => t.id === transactionId);

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Convertir la transacción bancaria al formato de la aplicación
            const newTransaction = {
                id: Date.now(),
                type: transaction.amount >= 0 ? 'income' : 'expense',
                description: transaction.description,
                amount: Math.abs(transaction.amount),
                category: transaction.category,
                date: transaction.date
            };

            // Agregar a las transacciones de la aplicación
            window.transactions.push(newTransaction);
            window.updateUI();

            // Marcar el botón como deshabilitado y cambiar el ícono
            const button = document.querySelector(`button[onclick*="importTransaction('${transactionId}"]`);
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('imported');
            }

            window.showNotification(
                'Success',
                `Transaction "${transaction.description}" for $${Math.abs(transaction.amount).toFixed(2)} has been imported`,
                'success'
            );
        } catch (error) {
            console.error('Error importing transaction:', error);
            window.showNotification('Error', 'Failed to import transaction', 'error');
        }
    }
}

// Inicializar y exportar
const bankIntegration = new BankIntegration();
window.bankIntegration = bankIntegration; 