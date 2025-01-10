export const monthlyManager = {
    elements: {
        prevMonthBtn: document.getElementById('prevMonth'),
        nextMonthBtn: document.getElementById('nextMonth'),
        currentMonthEl: document.getElementById('currentMonth'),
        monthIncomeEl: document.getElementById('monthIncome'),
        monthExpenseEl: document.getElementById('monthExpense'),
        monthBalanceEl: document.getElementById('monthBalance')
    },

    currentDate: new Date(),

    init() {
        this.elements.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        this.elements.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
        this.updateStats();
    },

    navigateMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.updateStats();

        // Actualizar el filtro de historial
        const dateFilterType = document.getElementById('dateFilterType');
        const monthFilter = document.querySelector('.month-filter');
        const customDateFilter = document.querySelector('.custom-date-filter');

        // Cambiar a filtro por mes si no está seleccionado
        if (dateFilterType.value !== 'month') {
            dateFilterType.value = 'month';
            monthFilter.style.display = 'block';
            customDateFilter.style.display = 'none';
        }

        // Actualizar la lista de transacciones
        window.historyManager.updateTransactionsList();

        const currentMonthElement = document.getElementById('currentMonth');
        if (currentMonthElement) {
            const newDate = new Date(this.currentDate);
            currentMonthElement.textContent = newDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }
    },

    getMonthRange(date) {
        // Crear fechas usando solo año y mes para evitar problemas con días
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Convertir las fechas a formato YYYY-MM-DD para comparación consistente
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    },

    formatMonth(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(date);
    },

    updateStats() {
        const { start, end } = this.getMonthRange(this.currentDate);
        const monthTransactions = window.transactions.filter(t => {
            // Comparar solo las fechas en formato YYYY-MM-DD
            return t.date >= start && t.date <= end;
        });

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const balance = income - expense;

        this.elements.monthIncomeEl.innerText = `$${income.toFixed(2)}`;
        this.elements.monthExpenseEl.innerText = `$${expense.toFixed(2)}`;
        this.elements.monthBalanceEl.innerText = `$${balance.toFixed(2)}`;
        this.elements.currentMonthEl.innerText = this.formatMonth(this.currentDate);

        const monthValue = this.currentDate.toISOString().slice(0, 7);
        document.getElementById('specificMonth').value = monthValue;
    },

    calculateMonthlyStats(transactions, date = new Date()) {
        // Asegurar que la fecha esté al inicio del mes
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        // Asegurar que la fecha final esté al final del mes
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const monthlyTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            // Comparar usando getTime() para precisión exacta
            return transactionDate.getTime() >= startOfMonth.getTime() && 
                   transactionDate.getTime() <= endOfMonth.getTime();
        });

        const stats = {
            income: 0,
            expense: 0,
            balance: 0,
            transactions: monthlyTransactions
        };

        monthlyTransactions.forEach(t => {
            if (t.type === 'income') {
                stats.income += t.amount;
            } else {
                stats.expense += t.amount;
            }
        });

        stats.balance = stats.income - stats.expense;
        return stats;
    }
}; 