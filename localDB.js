class LocalDB {
    constructor() {
        this.dbName = 'controlGastosDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Error al abrir la base de datos');
                // Si hay error, usar localStorage como fallback
                this.useFallback = true;
                resolve(false);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crear store de transacciones si no existe
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    transactionStore.createIndex('date', 'date', { unique: false });
                }

                // Crear store para pagos recurrentes
                if (!db.objectStoreNames.contains('recurringPayments')) {
                    db.createObjectStore('recurringPayments', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }
            };
        });
    }

    // Método para guardar transacciones
    async saveTransaction(transaction) {
        if (this.useFallback) {
            // Usar localStorage como fallback
            let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return transaction;
        }

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['transactions'], 'readwrite');
            const store = tx.objectStore('transactions');
            const request = store.add(transaction);

            request.onsuccess = () => resolve(transaction);
            request.onerror = () => reject(request.error);
        });
    }

    // Método para obtener todas las transacciones
    async getTransactions() {
        if (this.useFallback) {
            // Usar localStorage como fallback
            return JSON.parse(localStorage.getItem('transactions')) || [];
        }

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['transactions'], 'readonly');
            const store = tx.objectStore('transactions');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Método para eliminar una transacción
    async deleteTransaction(id) {
        if (this.useFallback) {
            // Usar localStorage como fallback
            let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            transactions = transactions.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            return true;
        }

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['transactions'], 'readwrite');
            const store = tx.objectStore('transactions');
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Método para actualizar una transacción
    async updateTransaction(id, updatedData) {
        if (this.useFallback) {
            // Usar localStorage como fallback
            let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            const index = transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                transactions[index] = { ...transactions[index], ...updatedData };
                localStorage.setItem('transactions', JSON.stringify(transactions));
                return transactions[index];
            }
            return null;
        }

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['transactions'], 'readwrite');
            const store = tx.objectStore('transactions');
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const transaction = { ...getRequest.result, ...updatedData };
                const updateRequest = store.put(transaction);

                updateRequest.onsuccess = () => resolve(transaction);
                updateRequest.onerror = () => reject(updateRequest.error);
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }
}

// Exportar una instancia única de la base de datos
const localDB = new LocalDB();
export default localDB; 