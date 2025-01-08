import { balanceManager } from './balanceManager.js';
import { monthlyManager } from './monthlyManager.js';
import { transactionManager } from './transactionManager.js';
import { historyManager } from './historyManager.js';
import { monthlyHistoryManager } from './monthlyHistoryManager.js';
import { recurringPaymentManager } from './recurringPaymentManager.js';
import { checkSession } from './auth.js';

// Variables globales
window.transactions = [];
window.recurringPayments = [];
window.currentUser = null;
window.presetTransactions = {
    income: {},
    expense: {}
};
window.historyManager = historyManager;
window.translations = {
    es: {
        // Balance y transacciones
        income: 'Ingreso',
        expense: 'Gasto',
        totalBalance: 'Balance Total',
        totalIncome: 'Ingresos Totales',
        totalExpense: 'Gastos Totales',

        // Categorías
        salary: 'Salario',
        business: 'Negocio',
        investments: 'Inversiones',
        extras: 'Extras',
        housing: 'Vivienda',
        food: 'Alimentación',
        transport: 'Transporte',
        services: 'Servicios',
        entertainment: 'Entretenimiento',
        healthcare: 'Salud',
        education: 'Educación',
        shopping: 'Compras',

        // Resumen mensual
        monthlySummary: 'Resumen del Mes',
        monthlyIncome: 'Ingresos del Mes',
        monthlyExpense: 'Gastos del Mes',
        monthlyBalance: 'Balance del Mes',
        annualSummary: 'Resumen Anual',

        // Notificaciones
        success: 'Éxito',
        error: 'Error',
        confirmDelete: '¿Está seguro de que desea eliminar esta transacción?',
        confirmAction: 'Confirmar Acción',

        // Pagos recurrentes
        recurringPaymentDeleted: 'Pago recurrente eliminado',
        recurringPaymentSaved: 'Pago recurrente guardado',
        recurringPaymentUpdated: 'Pago recurrente actualizado',
        loginRequired: 'Debe iniciar sesión para realizar esta acción',

        // Presets y formularios
        selectOrCreate: 'Seleccione o cree nueva',
        selectCategory: 'Seleccione categoría',
        savedPresets: 'Presets Guardados',
        frequentIncomes: 'Ingresos Frecuentes',
        frequentExpenses: 'Gastos Frecuentes',
        freelance: 'Trabajo Freelance',
        rentExpense: 'Alquiler/Hipoteca',
        utilities: 'Servicios (Luz/Agua/Gas)',
        groceries: 'Supermercado',
        internet: 'Internet/Teléfono',
        clothing: 'Ropa',
        restaurants: 'Restaurantes',
        rent: 'Alquiler',
        bonus: 'Bono',
        presetSaved: 'Preset guardado correctamente',
        fillRequiredFields: 'Por favor complete los campos necesarios',

        // Transacciones
        transactionDeleted: 'Transacción eliminada correctamente',
        transactionSaved: 'Transacción guardada correctamente',
        transactionUpdated: 'Transacción actualizada correctamente',
        incomeHelp: 'Ingrese los detalles del ingreso',
        expenseHelp: 'Ingrese los detalles del gasto',
        fillAllFields: 'Por favor complete todos los campos',

        expenseControl: "Control de Gastos",
        totalBalance: "Balance Total",
        totalIncome: "Ingresos",
        totalExpense: "Gastos",
        monthlySummary: "Resumen del Mes",
        newTransaction: "Nueva Transacción",
        transactionHistory: "Historial de Transacciones",
        monthlyHistory: "Historial por Mes",
        recurringPayments: "Pagos Recurrentes",

        // Campos del formulario
        transactionType: "Tipo de Transacción",
        frequentTransactions: "Transacciones Frecuentes",
        description: "Descripción",
        amount: "Monto",
        date: "Fecha",
        category: "Categoría",
        selectType: "Seleccione tipo",
        selectOrCreate: "Seleccione o cree nueva",
        selectCategory: "Seleccione categoría",
        enterPositiveAmount: "Ingrese el monto en positivo",
        selectDate: "Seleccione la fecha de la transacción",
        addTransaction: "Agregar Transacción",

        // Filtros de historial
        allHistory: "Todo el historial",
        customRange: "Rango personalizado",
        specificMonth: "Mes específico",
        lastWeek: "Última semana",
        today: "Hoy",
        allCategories: "Todas las categorías",
        allTypes: "Todos los tipos"
    },
    en: {
        // Balance and transactions
        income: 'Income',
        expense: 'Expense',
        totalBalance: 'Total Balance',
        totalIncome: 'Total Income',
        totalExpense: 'Total Expense',

        // Categories
        salary: 'Salary',
        business: 'Business',
        investments: 'Investments',
        extras: 'Extras',
        housing: 'Housing',
        food: 'Food',
        transport: 'Transport',
        services: 'Services',
        entertainment: 'Entertainment',
        healthcare: 'Healthcare',
        education: 'Education',
        shopping: 'Shopping',

        // Monthly summary
        monthlySummary: 'Monthly Summary',
        monthlyIncome: 'Monthly Income',
        monthlyExpense: 'Monthly Expense',
        monthlyBalance: 'Monthly Balance',
        annualSummary: 'Annual Summary',

        // Notifications
        success: 'Success',
        error: 'Error',
        confirmDelete: 'Are you sure you want to delete this transaction?',
        confirmAction: 'Confirm Action',

        // Recurring payments
        recurringPaymentDeleted: 'Recurring payment deleted',
        recurringPaymentSaved: 'Recurring payment saved',
        recurringPaymentUpdated: 'Recurring payment updated',
        loginRequired: 'You must be logged in to perform this action',

        // Presets and forms
        selectOrCreate: 'Select or create new',
        selectCategory: 'Select category',
        savedPresets: 'Saved Presets',
        frequentIncomes: 'Frequent Incomes',
        frequentExpenses: 'Frequent Expenses',
        freelance: 'Freelance Work',
        rentExpense: 'Rent/Mortgage',
        utilities: 'Utilities (Power/Water/Gas)',
        groceries: 'Groceries',
        internet: 'Internet/Phone',
        clothing: 'Clothing',
        restaurants: 'Restaurants',
        rent: 'Rent',
        bonus: 'Bonus',
        presetSaved: 'Preset saved successfully',
        fillRequiredFields: 'Please fill in the required fields',

        // Transactions
        transactionDeleted: 'Transaction successfully deleted',
        transactionSaved: 'Transaction successfully saved',
        transactionUpdated: 'Transaction successfully updated',
        incomeHelp: 'Enter income details',
        expenseHelp: 'Enter expense details',
        fillAllFields: 'Please fill in all fields',

        expenseControl: "Expense Control",
        totalBalance: "Total Balance",
        totalIncome: "Income",
        totalExpense: "Expenses",
        monthlySummary: "Monthly Summary",
        newTransaction: "New Transaction",
        transactionHistory: "Transaction History",
        monthlyHistory: "Monthly History",
        recurringPayments: "Recurring Payments",

        // Form fields
        transactionType: "Transaction Type",
        frequentTransactions: "Frequent Transactions",
        description: "Description",
        amount: "Amount",
        date: "Date",
        category: "Category",
        selectType: "Select type",
        selectOrCreate: "Select or create new",
        selectCategory: "Select category",
        enterPositiveAmount: "Enter positive amount",
        selectDate: "Select transaction date",
        addTransaction: "Add Transaction",

        // History filters
        allHistory: "All History",
        customRange: "Custom Range",
        specificMonth: "Specific Month",
        lastWeek: "Last Week",
        today: "Today",
        allCategories: "All Categories",
        allTypes: "All Types"
    }
};

// Función para actualizar toda la UI
function updateUI() {
    // Actualizar balance general
    balanceManager.updateTotalBalance(window.transactions);
    monthlyManager.updateStats();
    historyManager.updateTransactionsList();
    monthlyHistoryManager.generateMonthlyHistory(window.transactions);

    // Guardar datos en localStorage solo si hay usuario autenticado
    if (window.currentUser) {
        localStorage.setItem(
            `transactions_${window.currentUser.id}`,
            JSON.stringify(window.transactions)
        );
    }

    // Disparar evento de actualización
    window.dispatchEvent(new Event('transactionsUpdated'));
}

// Función para cargar datos
function loadData() {
    console.log('Loading data for user:', window.currentUser); // Para debug
    if (window.currentUser) {
        const storedTransactions = localStorage.getItem(`transactions_${window.currentUser.id}`);
        console.log('Stored transactions:', storedTransactions); // Para debug
        window.transactions = JSON.parse(storedTransactions) || [];
        window.recurringPayments = JSON.parse(localStorage.getItem(`recurring_${window.currentUser.id}`)) || [];
        window.presetTransactions = JSON.parse(localStorage.getItem(`presets_${window.currentUser.id}`)) || {
            income: {},
            expense: {}
        };
    } else {
        window.transactions = [];
        window.recurringPayments = [];
        window.presetTransactions = { income: {}, expense: {} };
    }
    updateUI();
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar módulos
    monthlyManager.init();
    transactionManager.init();
    historyManager.init();
    recurringPaymentManager.init();

    // Verificar si hay usuario guardado y cargar sus datos
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        window.currentUser = user;

        // Cargar transacciones inmediatamente
        const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
        if (storedTransactions) {
            window.transactions = JSON.parse(storedTransactions);
            window.updateUI();
        }
    }

    // Escuchar cambios de autenticación
    document.addEventListener('authStateChanged', (e) => {
        if (e.detail.user) {
            // Si hay usuario, cargar sus datos
            const storedTransactions = localStorage.getItem(`transactions_${e.detail.user.id}`);
            window.transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
        } else {
            // Si no hay usuario, limpiar datos
            window.transactions = [];
        }
        window.updateUI();
    });
});

// Exportar funciones necesarias globalmente
window.updateUI = updateUI;
window.showNotification = function (title, message, type) {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.warn('Notification container not found');
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    notification.innerHTML = `
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(notification);
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 3000);
};

// Hacer disponible el recurringPaymentManager globalmente
window.recurringPaymentManager = recurringPaymentManager;

// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Cambiar el ícono
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
});

// Cargar tema guardado
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.querySelector('i').className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';

// Language toggle functionality
const languageToggle = document.querySelector('.language-toggle');
languageToggle.addEventListener('click', () => {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'es';
    const newLang = currentLang === 'es' ? 'en' : 'es';

    // Cambiar el atributo de idioma
    document.documentElement.setAttribute('data-lang', newLang);
    localStorage.setItem('language', newLang);

    // Actualizar el texto del botón
    const langText = languageToggle.querySelector('.lang-text');
    langText.textContent = newLang.toUpperCase();

    // Actualizar todos los textos traducibles
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[newLang][key]) {
            element.textContent = translations[newLang][key];
        }
    });

    // Actualizar la UI
    updateUI();
});

// Cargar idioma guardado al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'es';
    document.documentElement.setAttribute('data-lang', savedLang);
    const langText = document.querySelector('.language-toggle .lang-text');
    if (langText) {
        langText.textContent = savedLang.toUpperCase();
    }
});

// Función para formatear la fecha en inglés
function formatMonth(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
}

// Para el selector de mes actual
function updateCurrentMonth() {
    const currentMonthElement = document.getElementById('currentMonth');
    if (currentMonthElement) {
        currentMonthElement.textContent = new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }
}

// Para el historial mensual
function formatMonthHeader(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
}

// Para cualquier otra parte donde se muestren fechas
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTransactionDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
