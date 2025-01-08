export const historyManager = {
    elements: {
        transactionsEl: document.getElementById('transactions'),
        filterCategory: document.getElementById('filter-category'),
        filterType: document.getElementById('filter-type'),
        dateFilterType: document.getElementById('dateFilterType'),
        startDate: document.getElementById('startDate'),
        endDate: document.getElementById('endDate'),
        specificMonth: document.getElementById('specificMonth'),
        customDateFilter: document.querySelector('.custom-date-filter'),
        monthFilter: document.querySelector('.month-filter')
    },

    init() {
        // Establecer fecha actual en los inputs de fecha
        const today = new Date();
        const currentMonth = today.toISOString().slice(0, 7); // Formato YYYY-MM

        this.elements.specificMonth.value = currentMonth;
        this.elements.startDate.value = today.toISOString().slice(0, 10);
        this.elements.endDate.value = today.toISOString().slice(0, 10);

        // Establecer el filtro por defecto en 'month' y mostrar el filtro de mes
        this.elements.dateFilterType.value = 'month';
        this.elements.customDateFilter.style.display = 'none';
        this.elements.monthFilter.style.display = 'block';

        this.setupEventListeners();
        this.updateTransactionsList();
    },

    setupEventListeners() {
        this.elements.filterCategory.addEventListener('change', () => this.updateTransactionsList());
        this.elements.filterType.addEventListener('change', () => this.updateTransactionsList());
        this.elements.dateFilterType.addEventListener('change', () => {
            this.toggleDateFilters();
            this.updateTransactionsList();
        });
        this.elements.startDate.addEventListener('change', () => this.updateTransactionsList());
        this.elements.endDate.addEventListener('change', () => this.updateTransactionsList());

        // Modificar el event listener del mes específico
        this.elements.specificMonth.addEventListener('change', () => {
            this.updateTransactionsList();

            // Actualizar el resumen mensual cuando se cambia el mes
            if (this.elements.dateFilterType.value === 'month') {
                const [year, month] = this.elements.specificMonth.value.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1);
                window.monthlyManager.currentDate = date;
                window.monthlyManager.updateStats();
            }
        });
    },

    toggleDateFilters() {
        const dateFilter = this.elements.dateFilterType.value;
        this.elements.customDateFilter.style.display = dateFilter === 'custom' ? 'block' : 'none';
        this.elements.monthFilter.style.display = dateFilter === 'month' ? 'block' : 'none';
    },

    filterTransactions(transactions) {
        if (!transactions || transactions.length === 0) return [];

        const categoryFilter = this.elements.filterCategory.value;
        const typeFilter = this.elements.filterType.value;
        const dateFilter = this.elements.dateFilterType.value;

        return transactions.filter(transaction => {
            // Filtro por categoría
            const categoryMatch = categoryFilter === 'todas' || transaction.category === categoryFilter;

            // Filtro por tipo
            const typeMatch = typeFilter === 'todas' ||
                (typeFilter === 'ingreso' && transaction.type === 'income') ||
                (typeFilter === 'gasto' && transaction.type === 'expense');

            // Filtro por fecha
            let dateMatch = true;
            const transactionDate = new Date(transaction.date + 'T00:00:00'); // Asegurar medianoche local

            if (dateFilter !== 'all') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (dateFilter) {
                    case 'today':
                        dateMatch = transactionDate.toDateString() === today.toDateString();
                        break;

                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        dateMatch = transactionDate >= weekAgo;
                        break;

                    case 'month':
                        if (this.elements.specificMonth.value) {
                            const [year, month] = this.elements.specificMonth.value.split('-');
                            dateMatch =
                                transactionDate.getFullYear() === parseInt(year) &&
                                transactionDate.getMonth() === parseInt(month) - 1;
                        }
                        break;

                    case 'custom':
                        if (this.elements.startDate.value && this.elements.endDate.value) {
                            const start = new Date(this.elements.startDate.value + 'T00:00:00');
                            const end = new Date(this.elements.endDate.value + 'T23:59:59');
                            dateMatch = transactionDate >= start && transactionDate <= end;
                        }
                        break;
                }
            }

            return categoryMatch && typeMatch && dateMatch;
        });
    },

    updateTransactionsList() {
        const filteredTransactions = this.filterTransactions(window.transactions);
        this.renderTransactions(filteredTransactions);
    },

    renderTransactions(transactions) {
        this.elements.transactionsEl.innerHTML = '';
        const currentLang = document.documentElement.getAttribute('data-lang') || 'es';

        transactions.forEach(transaction => {
            const li = document.createElement('li');
            li.className = `transaction-item ${transaction.type === 'income' ? 'plus' : 'minus'}`;

            // Crear la fecha en la zona horaria local
            const date = new Date(transaction.date + 'T12:00:00');

            li.innerHTML = `
                <div class="transaction-info">
                    <span>${transaction.description}</span>
                    <span class="transaction-category">${window.translations['en'][transaction.category] || transaction.category}</span>
                    <span class="transaction-date">${date.toLocaleDateString()}</span>
                </div>
                <div class="transaction-actions">
                    <span class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</span>
                    <button class="action-button edit" onclick="window.historyManager.editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-button delete" onclick="window.historyManager.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.elements.transactionsEl.appendChild(li);
        });
    },

    deleteTransaction(id) {
        const currentLang = document.documentElement.getAttribute('data-lang') || 'es';
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmAction = document.getElementById('confirmAction');
        const cancelConfirmation = document.getElementById('cancelConfirmation');

        confirmationMessage.textContent = window.translations['en'].confirmDelete;
        confirmationModal.style.display = 'block';

        confirmAction.onclick = () => {
            const index = window.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                window.transactions.splice(index, 1);
                window.updateUI();
                window.showNotification(
                    window.translations[currentLang].success,
                    window.translations[currentLang].transactionDeleted,
                    'success'
                );
            }
            confirmationModal.style.display = 'none';
        };

        cancelConfirmation.onclick = () => {
            confirmationModal.style.display = 'none';
        };
    },

    editTransaction(id) {
        const transaction = window.transactions.find(t => t.id === id);
        if (!transaction) return;

        // Llenar el formulario con los datos de la transacción
        const form = document.getElementById('form');
        const typeSelect = document.getElementById('transaction-type');
        const descriptionInput = document.getElementById('description');
        const amountInput = document.getElementById('amount');
        const categorySelect = document.getElementById('category');
        const dateInput = document.getElementById('transaction-date');

        // Establecer valores
        typeSelect.value = transaction.type;
        typeSelect.dispatchEvent(new Event('change')); // Para actualizar categorías
        descriptionInput.value = transaction.description;
        amountInput.value = transaction.amount;
        categorySelect.value = transaction.category;
        dateInput.value = transaction.date;

        // Marcar que estamos editando
        form.dataset.editId = id;

        // Hacer scroll al formulario
        form.scrollIntoView({ behavior: 'smooth' });
    }
}; 