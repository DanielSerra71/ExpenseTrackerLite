class BankIntegration {
    constructor() {
        // Check login
        const currentUser = JSON.parse(localStorage.getItem('currentSession'));
        if (!currentUser) {
            this.showLoginMessage();
            return;
        }

        this.userId = currentUser.id;
        this.connections = this.loadConnections();
        this.setupEventListeners();
        this.updateBanksList();
    }

    loadConnections() {
        return JSON.parse(localStorage.getItem(`bank_connections_${this.userId}`)) || {};
    }

    saveConnections() {
        localStorage.setItem(`bank_connections_${this.userId}`, JSON.stringify(this.connections));
    }

    setupEventListeners() {
        const form = document.getElementById('bankConnectionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleConnection();
            });
        }
    }

    handleConnection() {
        const bankName = document.getElementById('bankSelect').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!bankName || !username || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Simulate successful connection
        this.connections[bankName] = {
            username,
            connected: true,
            lastSync: new Date().toISOString()
        };

        this.saveConnections();
        this.updateBanksList();
        this.showNotification('Bank successfully connected', 'success');
        document.getElementById('bankConnectionForm').reset();
    }

    updateBanksList() {
        const container = document.getElementById('banksList');
        if (!container) return;

        if (Object.keys(this.connections).length === 0) {
            container.innerHTML = '<p class="empty-message">No connected banks</p>';
            return;
        }

        container.innerHTML = Object.entries(this.connections)
            .map(([bankName, data]) => `
                <div class="bank-card">
                    <div class="bank-info">
                        <i class="fas fa-university"></i>
                        <span>${bankName}</span>
                    </div>
                    <button onclick="bankIntegration.disconnectBank('${bankName}')" class="btn-icon">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
    }

    disconnectBank(bankName) {
        if (confirm('Are you sure you want to disconnect this bank?')) {
            delete this.connections[bankName];
            this.saveConnections();
            this.updateBanksList();
            this.showNotification('Bank successfully disconnected', 'success');
        }
    }

    showNotification(message, type) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showLoginMessage() {
        const container = document.querySelector('.bank-integration-section');
        if (container) {
            container.innerHTML = `
                <div class="login-message">
                    <i class="fas fa-lock"></i>
                    <p>You must be logged in to connect your bank accounts</p>
                    <button onclick="window.location.href='index.html'" class="btn-submit">
                        Go to home
                    </button>
                </div>
            `;
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.bankIntegration = new BankIntegration();
}); 