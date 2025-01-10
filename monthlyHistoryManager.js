export const monthlyHistoryManager = {
    elements: {
        monthListEl: document.getElementById('monthList')
    },

    generateMonthlyHistory(transactions) {
        const monthlyGroups = {};
        let annualSummary = {
            income: 0,
            expense: 0
        };

        // Agrupar por mes y calcular totales
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

            if (!monthlyGroups[monthKey]) {
                monthlyGroups[monthKey] = {
                    date: date,
                    transactions: [],
                    totals: { income: 0, expense: 0 }
                };
            }

            monthlyGroups[monthKey].transactions.push(transaction);

            if (transaction.type === 'income') {
                monthlyGroups[monthKey].totals.income += transaction.amount;
                annualSummary.income += transaction.amount;
            } else {
                monthlyGroups[monthKey].totals.expense += transaction.amount;
                annualSummary.expense += transaction.amount;
            }
        });

        this.renderMonthlyHistory(monthlyGroups, annualSummary);
    },

    renderMonthlyHistory(monthlyGroups, annualSummary) {
        const currentLang = document.documentElement.getAttribute('data-lang') || 'es';
        const totalBalance = annualSummary.income - annualSummary.expense;
        const isPositive = totalBalance >= 0;

        // Renderizar resumen anual
        const annualSummaryHTML = `
            <div class="annual-summary">
                <h4>Annual Summary</h4>
                <div class="annual-stats">
                    <div class="stat-item income">
                        <span class="stat-label">Income</span>
                        <span class="stat-value">+$${annualSummary.income.toFixed(2)}</span>
                    </div>
                    <div class="stat-item expense">
                        <span class="stat-label">Expenses</span>
                        <span class="stat-value">-$${annualSummary.expense.toFixed(2)}</span>
                    </div>
                    <div class="stat-item balance ${isPositive ? 'positive' : 'negative'}">
                        <span class="stat-label">Total Balance</span>
                        <span class="stat-value">${isPositive ? '+' : '-'}$${Math.abs(totalBalance).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;

        this.elements.monthListEl.innerHTML = annualSummaryHTML;

        // Ordenar y renderizar meses
        const sortedMonths = Object.values(monthlyGroups).sort((a, b) => b.date - a.date);
        sortedMonths.forEach(monthData => {
            const monthEl = document.createElement('div');
            monthEl.className = 'month-item';
            monthEl.innerHTML = this.generateMonthHTML(monthData, currentLang);
            this.elements.monthListEl.appendChild(monthEl);

            // Agregar evento para mostrar/ocultar detalles
            const header = monthEl.querySelector('.month-header');
            const details = monthEl.querySelector('.month-transactions');
            header.addEventListener('click', () => {
                details.classList.toggle('show');
            });
        });
    },

    generateMonthHTML(monthData, currentLang) {
        return `
            <div class="month-header">
                <h5>${this.formatMonth(monthData.date)}</h5>
                <div>
                    <span class="income">+$${monthData.totals.income.toFixed(2)}</span>
                    <span class="expense">-$${monthData.totals.expense.toFixed(2)}</span>
                </div>
            </div>
            <div class="month-transactions">
                ${this.renderTransactionGroups(monthData.transactions, currentLang)}
            </div>
        `;
    },

    formatMonth(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(date);
    },

    renderTransactionGroups(transactions, currentLang) {
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');

        return `
            ${this.renderTransactionGroup(incomeTransactions, 'income', currentLang)}
            ${this.renderTransactionGroup(expenseTransactions, 'expense', currentLang)}
        `;
    },

    renderTransactionGroup(transactions, type, currentLang) {
        if (transactions.length === 0) return '';

        const typeLabel = type === 'income' ? 'Income' : 'Expenses';

        return `
            <div class="transaction-group">
                <h6>${typeLabel}</h6>
                ${transactions.map(t => `
                    <div class="transaction-item ${type === 'income' ? 'plus' : 'minus'}">
                        <div class="transaction-info">
                            <span>${t.description}</span>
                            <span class="transaction-category">${translations['en'][t.category] || t.category}</span>
                        </div>
                        <span>${type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}; 