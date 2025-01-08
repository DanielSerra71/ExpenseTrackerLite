export const balanceManager = {
    elements: {
        balanceEl: document.getElementById('balance'),
        incomeEl: document.getElementById('income'),
        expenseEl: document.getElementById('expense')
    },

    updateTotalBalance(transactions) {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const balance = income - expense;

        this.elements.balanceEl.innerText = `$${balance.toFixed(2)}`;
        this.elements.incomeEl.innerText = `$${income.toFixed(2)}`;
        this.elements.expenseEl.innerText = `$${expense.toFixed(2)}`;
    }
}; 