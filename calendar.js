export class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.transactions = [];
        this.recurringPayments = [];
    }

    init() {
        // Cargar datos
        this.loadData();

        // Inicializar controles del calendario
        this.initializeControls();

        // Renderizar el calendario inicial
        this.renderCalendar();
    }

    loadData() {
        // Cargar transacciones del usuario actual
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const storedTransactions = localStorage.getItem(`transactions_${currentUser.id}`);
            if (storedTransactions) {
                this.transactions = JSON.parse(storedTransactions);
            }

            // Cargar pagos recurrentes
            const storedRecurring = localStorage.getItem(`recurring_${currentUser.id}`);
            if (storedRecurring) {
                this.recurringPayments = JSON.parse(storedRecurring);
            }
        }
    }

    initializeControls() {
        // Event listeners para los botones de navegación
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Actualizar el título del mes
        document.getElementById('currentMonth').textContent =
            new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Obtener el primer día del mes y el total de días
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Generar la cuadrícula del calendario
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';

        // Agregar celdas vacías para los días antes del primer día del mes
        for (let i = 0; i < firstDay; i++) {
            calendarGrid.appendChild(this.createDayCell(''));
        }

        // Agregar celdas para cada día del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const cell = this.createDayCell(day);

            // Agregar transacciones del día
            const dayTransactions = this.getTransactionsForDate(date);
            if (dayTransactions.length > 0) {
                const transactionsList = document.createElement('div');
                transactionsList.className = 'day-transactions';

                dayTransactions.forEach(transaction => {
                    const transactionEl = document.createElement('div');
                    transactionEl.className = `transaction-dot ${transaction.type}`;
                    transactionEl.title = `${transaction.description}: $${Math.abs(transaction.amount)}`;
                    transactionsList.appendChild(transactionEl);
                });

                cell.appendChild(transactionsList);
            }

            // Agregar pagos recurrentes del día
            const recurringPayments = this.getRecurringPaymentsForDate(date);
            if (recurringPayments.length > 0) {
                const recurringList = document.createElement('div');
                recurringList.className = 'recurring-payments';

                recurringPayments.forEach(payment => {
                    const paymentEl = document.createElement('div');
                    paymentEl.className = 'recurring-dot';
                    paymentEl.title = `${payment.description}: $${payment.amount}`;
                    recurringList.appendChild(paymentEl);
                });

                cell.appendChild(recurringList);
            }

            calendarGrid.appendChild(cell);
        }
    }

    createDayCell(day) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';

        if (day !== '') {
            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            cell.appendChild(dayNumber);
        }

        return cell;
    }

    getTransactionsForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.transactions.filter(t => t.date === dateString);
    }

    getRecurringPaymentsForDate(date) {
        return this.recurringPayments.filter(payment => {
            const paymentDate = new Date(payment.startDate);
            // Verificar si el pago recurrente cae en esta fecha según su frecuencia
            if (payment.frequency === 'monthly') {
                return paymentDate.getDate() === date.getDate();
            }
            // Agregar más lógica para otras frecuencias (semanal, anual, etc.)
            return false;
        });
    }

    // Método para actualizar los datos
    updateData(transactions, recurringPayments) {
        this.transactions = transactions;
        this.recurringPayments = recurringPayments;
        this.renderCalendar();
    }
} 