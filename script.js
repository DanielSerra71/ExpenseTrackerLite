// Elementos del DOM principales
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const transactionsEl = document.getElementById('transactions');
const form = document.getElementById('form');
const themeToggle = document.querySelector('.theme-toggle');

// Elementos del formulario
const transactionTypeSelect = document.getElementById('transaction-type');
const presetSelect = document.getElementById('preset-transactions');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const savePresetBtn = document.getElementById('save-preset');
const transactionDateInput = document.getElementById('transaction-date');

// Elementos de filtros
const filterCategory = document.getElementById('filter-category');
const filterType = document.getElementById('filter-type');
const dateFilterType = document.getElementById('dateFilterType');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const specificMonth = document.getElementById('specificMonth');
const customDateFilter = document.querySelector('.custom-date-filter');
const monthFilter = document.querySelector('.month-filter');

// Agregar después de las declaraciones de variables existentes
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthEl = document.getElementById('currentMonth');
const monthIncomeEl = document.getElementById('monthIncome');
const monthExpenseEl = document.getElementById('monthExpense');
const monthBalanceEl = document.getElementById('monthBalance');
const monthListEl = document.getElementById('monthList');

// Agregar al inicio del archivo con las otras constantes
const recurringModal = document.getElementById('recurringModal');
const remindersModal = document.getElementById('remindersModal');

// Inicializar la fecha actual al principio del archivo con las otras constantes
let currentDate = new Date();

// Función para filtrar transacciones
function filterTransactions(transactions) {
    if (!transactions || transactions.length === 0) return [];

    const categoryFilter = filterCategory.value;
    const typeFilter = filterType.value;
    const dateFilter = dateFilterType.value;

    return transactions.filter(transaction => {
        // Filtro por categoría
        const categoryMatch = categoryFilter === 'todas' || transaction.category === categoryFilter;

        // Filtro por tipo
        const typeMatch = typeFilter === 'todas' ||
            (typeFilter === 'ingreso' && transaction.type === 'income') ||
            (typeFilter === 'gasto' && transaction.type === 'expense');

        // Filtro por fecha
        let dateMatch = true;

        if (dateFilter !== 'all') {
            const transactionDate = new Date(transaction.date);
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
                    if (specificMonth.value) {
                        const [year, month] = specificMonth.value.split('-');
                        dateMatch = transactionDate.getFullYear() === parseInt(year) &&
                            transactionDate.getMonth() === parseInt(month) - 1;
                    }
                    break;
                case 'custom':
                    if (startDate.value && endDate.value) {
                        const start = new Date(startDate.value);
                        start.setHours(0, 0, 0, 0);
                        const end = new Date(endDate.value);
                        end.setHours(23, 59, 59, 999);
                        dateMatch = transactionDate >= start && transactionDate <= end;
                    }
                    break;
            }
        }

        return categoryMatch && typeMatch && dateMatch;
    });
}

// Función para actualizar la interfaz de usuario
function updateUI() {
    // Primero actualizar el balance general
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    // Actualizar los elementos del balance general
    balanceEl.innerText = `$${balance.toFixed(2)}`;
    incomeEl.innerText = `$${income.toFixed(2)}`;
    expenseEl.innerText = `$${expense.toFixed(2)}`;

    // Limpiar el contenedor de transacciones antes de agregar las nuevas
    transactionsEl.innerHTML = '';

    // Obtener las transacciones filtradas
    let filteredTransactions = filterTransactions(transactions);

    // Si no hay transacciones, mostrar mensaje
    if (filteredTransactions.length === 0) {
        transactionsEl.innerHTML = '<p class="empty-message">No hay transacciones para mostrar</p>';
        return;
    }

    // Renderizar las transacciones filtradas
    filteredTransactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add('transaction-item', transaction.type === 'income' ? 'plus' : 'minus');
        li.innerHTML = `
            <div class="transaction-info">
                <span>${transaction.description}</span>
                <span class="transaction-category">${transaction.category}</span>
                <span class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</span>
            </div>
            <span class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</span>
        `;
        transactionsEl.appendChild(li);
    });
}

// Event listeners para los filtros de fechas
dateFilterType.addEventListener('change', () => {
    customDateFilter.style.display = dateFilterType.value === 'custom' ? 'block' : 'none';
    monthFilter.style.display = dateFilterType.value === 'month' ? 'block' : 'none';
    updateUI();
});

startDate.addEventListener('change', updateUI);
endDate.addEventListener('change', updateUI);
specificMonth.addEventListener('change', updateUI);

// Cargar transacciones almacenadas y actualizar la interfaz
document.addEventListener('DOMContentLoaded', () => {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Establecer el filtro de fecha en "Mes específico" y el mes actual
    dateFilterType.value = 'month';
    const currentMonth = currentDate.toISOString().slice(0, 7); // Formato YYYY-MM
    specificMonth.value = currentMonth;

    // Mostrar el filtro de mes específico
    customDateFilter.style.display = 'none';
    monthFilter.style.display = 'block';

    updateUI();
    updateMonthlyStats();
    generateMonthlyHistory();
});

// Event listeners para los botones de navegación de mes
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateMonthlyStats();
    generateMonthlyHistory();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateMonthlyStats();
    generateMonthlyHistory();
});

// Función para actualizar el resumen del mes actual
function updateMonthlyStats() {
    const { start, end } = getMonthRange(currentDate);

    // Filtrar transacciones del mes actual
    const monthTransactions = transactions.filter(t => {
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

    // Actualizar los elementos del resumen mensual
    monthIncomeEl.innerText = `$${income.toFixed(2)}`;
    monthExpenseEl.innerText = `$${expense.toFixed(2)}`;
    monthBalanceEl.innerText = `$${balance.toFixed(2)}`;
    currentMonthEl.innerText = formatMonth(currentDate);
}

// Función para obtener el primer y último día del mes
function getMonthRange(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// Función para formatear fecha
function formatMonth(date) {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'es';
    return new Intl.DateTimeFormat(currentLang === 'es' ? 'es-ES' : 'en-US', {
        month: 'long',
        year: 'numeric'
    }).format(date);
}