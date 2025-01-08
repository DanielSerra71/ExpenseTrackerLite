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
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);

        return { start, end };
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
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end;
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
    }
}; 