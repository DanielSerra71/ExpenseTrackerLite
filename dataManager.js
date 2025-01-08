class DataManager {
    constructor() {
        this.dbName = 'controlGastosDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.log('Usando localStorage como almacenamiento principal');
                this.isInitialized = true;
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('transactions')) {
                    db.createObjectStore('transactions', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.isInitialized = true;
                this.syncFromLocalStorage();
            };
        } catch (error) {
            console.log('Error al inicializar IndexedDB, usando localStorage');
            this.isInitialized = true;
        }
    }

    // Sincronizar datos desde localStorage a IndexedDB
    async syncFromLocalStorage() {
        if (!this.db) return;

        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const tx = this.db.transaction(['transactions'], 'readwrite');
        const store = tx.objectStore('transactions');

        transactions.forEach(transaction => {
            store.put(transaction);
        });
    }

    // Sincronizar datos desde IndexedDB a localStorage
    async syncToLocalStorage() {
        if (!this.db) return;

        const tx = this.db.transaction(['transactions'], 'readonly');
        const store = tx.objectStore('transactions');
        const request = store.getAll();

        request.onsuccess = () => {
            localStorage.setItem('transactions', JSON.stringify(request.result));
        };
    }

    // Backup automático
    async createBackup() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const backup = {
            transactions,
            date: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `control_gastos_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Restaurar desde backup
    async restoreFromBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    localStorage.setItem('transactions', JSON.stringify(backup.transactions));
                    await this.syncFromLocalStorage();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }
}

const dataManager = new DataManager();
export default dataManager; 