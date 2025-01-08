class Database {
    constructor() {
        this.dbName = 'controlGastosDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject('Error al abrir la base de datos');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crear store de usuarios
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'email' });
                    userStore.createIndex('email', 'email', { unique: true });
                }

                // Crear store de transacciones
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    transactionStore.createIndex('userId', 'userId', { unique: false });
                    transactionStore.createIndex('date', 'date', { unique: false });
                }

                // Crear store para pagos recurrentes
                if (!db.objectStoreNames.contains('recurringPayments')) {
                    const recurringStore = db.createObjectStore('recurringPayments', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    recurringStore.createIndex('userId', 'userId', { unique: false });
                }
            };
        });
    }

    // Métodos de usuario
    async createUser(email, password, name) {
        const user = {
            email,
            password, // En producción deberías hashear la contraseña
            name,
            createdAt: new Date()
        };

        return this.executeTransaction('users', 'readwrite', store => {
            return store.add(user);
        });
    }

    async getUser(email, password) {
        return this.executeTransaction('users', 'readonly', store => {
            return store.get(email);
        });
    }

    // Métodos de transacciones
    async addTransaction(userId, transaction) {
        const newTransaction = {
            userId,
            ...transaction,
            createdAt: new Date()
        };

        return this.executeTransaction('transactions', 'readwrite', store => {
            return store.add(newTransaction);
        });
    }

    async getTransactions(userId) {
        return this.executeTransaction('transactions', 'readonly', store => {
            const index = store.index('userId');
            return index.getAll(userId);
        });
    }

    async updateTransaction(id, transaction) {
        return this.executeTransaction('transactions', 'readwrite', store => {
            return store.put({ id, ...transaction });
        });
    }

    async deleteTransaction(id) {
        return this.executeTransaction('transactions', 'readwrite', store => {
            return store.delete(id);
        });
    }

    // Métodos de pagos recurrentes
    async addRecurringPayment(userId, payment) {
        const newPayment = {
            userId,
            ...payment,
            createdAt: new Date()
        };

        return this.executeTransaction('recurringPayments', 'readwrite', store => {
            return store.add(newPayment);
        });
    }

    async getRecurringPayments(userId) {
        return this.executeTransaction('recurringPayments', 'readonly', store => {
            const index = store.index('userId');
            return index.getAll(userId);
        });
    }

    // Método helper para ejecutar transacciones
    executeTransaction(storeName, mode, callback) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);

            let request;
            try {
                request = callback(store);
            } catch (err) {
                reject(err);
                return;
            }

            transaction.oncomplete = () => {
                resolve(request.result);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    // Método para exportar datos
    async exportData(userId) {
        const transactions = await this.getTransactions(userId);
        const recurringPayments = await this.getRecurringPayments(userId);

        const data = {
            transactions,
            recurringPayments,
            exportDate: new Date()
        };

        return JSON.stringify(data);
    }

    // Método para importar datos
    async importData(userId, jsonData) {
        const data = JSON.parse(jsonData);

        // Importar transacciones
        for (const transaction of data.transactions) {
            await this.addTransaction(userId, transaction);
        }

        // Importar pagos recurrentes
        for (const payment of data.recurringPayments) {
            await this.addRecurringPayment(userId, payment);
        }
    }
}

const db = new Database();
export default db; 