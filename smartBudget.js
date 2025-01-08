class SmartBudget {
    constructor(transactions) {
        console.log('SmartBudget inicializado con:', transactions); // Debug
        this.transactions = transactions || [];
        this.observers = [];  // Lista de callbacks para notificar cambios
    }

    // Método para suscribirse a cambios
    subscribe(callback) {
        this.observers.push(callback);
        // Ejecutar callback inmediatamente con los datos actuales
        callback(this.calculateStats());
        return () => {
            // Retorna función para desuscribirse
            this.observers = this.observers.filter(cb => cb !== callback);
        };
    }

    // Notificar a todos los observadores
    notifyObservers() {
        const stats = this.calculateStats();
        this.observers.forEach(callback => callback(stats));
    }

    calculateStats() {
        // Gastos totales
        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Promedio mensual
        const uniqueMonths = new Set(
            this.transactions
                .filter(t => t.type === 'expense')
                .map(t => t.date.substring(0, 7))
        );
        const monthCount = Math.max(uniqueMonths.size, 1);
        const monthlyAverage = expenses / monthCount;

        // Potencial de ahorro
        const currentMonth = new Date().toISOString().substring(0, 7);
        const currentMonthIncome = this.transactions
            .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthlyExpenses = this.transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const savingsPotential = Math.max(0, currentMonthIncome - monthlyExpenses);

        // Calcular ingreso mensual promedio
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const averageMonthlyIncome = totalIncome / Math.max(monthCount, 1);

        console.log('Estadísticas calculadas:', { // Debug
            expenses,
            monthlyAverage,
            savingsPotential,
            monthCount,
            averageMonthlyIncome,
            currentMonthIncome,
            monthlyExpenses
        });

        return {
            totalExpenses: expenses,
            monthlyAverage: monthlyAverage,
            savingsPotential: savingsPotential,
            monthlyIncome: averageMonthlyIncome,
            monthlyExpenses: monthlyExpenses
        };
    }

    updateTransactions(newTransactions) {
        console.log('Actualizando transacciones:', newTransactions); // Debug
        this.transactions = newTransactions;
        this.notifyObservers();  // Notificar cambios
    }
}

export default SmartBudget; 