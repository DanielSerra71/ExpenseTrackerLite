export class Calendar {
    constructor() {
        // Inicializar con la fecha actual en lugar de una fecha futura
        const today = new Date();
        this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.transactions = [];
        this.recurringPayments = [];
    }

    init() {
        this.loadData();
        this.initializeControls();
        this.renderCalendar();

        // Debug: Mostrar el mes actual que estamos viendo
        console.log('Mes actual del calendario:', this.currentDate.toISOString());
    }

    loadData() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('Usuario actual:', currentUser); // Debug usuario

        if (currentUser) {
            // Cargar transacciones normales
            const storedTransactions = localStorage.getItem(`transactions_${currentUser.id}`);
            console.log('Transacciones almacenadas (raw):', storedTransactions); // Debug transacciones raw

            if (storedTransactions) {
                this.transactions = JSON.parse(storedTransactions).map(t => ({
                    ...t,
                    date: new Date(t.date).toISOString().split('T')[0] // Normalizar formato de fecha
                }));
                console.log('Transacciones parseadas:', this.transactions); // Debug transacciones parseadas

                // Debug: Mostrar las transacciones ordenadas por fecha
                console.log('Transacciones ordenadas por fecha:',
                    this.transactions.sort((a, b) => new Date(a.date) - new Date(b.date)));
            }

            // Debug: Verificar las transacciones después de cargarlas
            console.log('Transacciones después de formatear:', this.transactions);

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

        document.getElementById('currentMonth').textContent =
            new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

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

            if (dayTransactions && dayTransactions.length > 0) {
                const transactionsContainer = document.createElement('div');
                transactionsContainer.className = 'day-transactions';

                dayTransactions.forEach(transaction => {
                    const transactionDot = document.createElement('div');
                    const amount = Math.abs(parseFloat(transaction.amount)).toFixed(2);

                    // Crear el tooltip personalizado
                    const tooltip = document.createElement('div');
                    tooltip.className = 'transaction-tooltip';
                    tooltip.innerHTML = `
                        <div class="tooltip-header ${transaction.type}">
                            <i class="fas ${transaction.type === 'income' ? 'fa-plus' : 'fa-minus'}"></i>
                            <span>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                        </div>
                        <div class="tooltip-content">
                            <div class="tooltip-row">
                                <span>Description:</span>
                                <span>${transaction.description}</span>
                            </div>
                            <div class="tooltip-row">
                                <span>Amount:</span>
                                <span class="${transaction.type}">
                                    ${transaction.type === 'income' ? '+' : '-'}$${amount}
                                </span>
                            </div>
                            <div class="tooltip-row">
                                <span>Date:</span>
                                <span>${new Date(transaction.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;

                    // Determinar el tipo de transacción y aplicar el estilo
                    if (transaction.type === 'income') {
                        transactionDot.className = 'transaction-dot income';
                    } else {
                        transactionDot.className = 'transaction-dot expense';
                    }

                    // Agregar el tooltip al dot
                    transactionDot.appendChild(tooltip);

                    transactionsContainer.appendChild(transactionDot);
                });

                cell.appendChild(transactionsContainer);
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

            // Agregar clase para el día actual
            const currentDate = new Date();
            if (this.currentDate.getMonth() === currentDate.getMonth() &&
                this.currentDate.getFullYear() === currentDate.getFullYear() &&
                day === currentDate.getDate()) {
                cell.classList.add('current-day');
            }
        }

        return cell;
    }

    getTransactionsForDate(date) {
        // Formatear la fecha para comparar con las transacciones
        const dateString = date.toISOString().split('T')[0];
        console.log('Buscando transacciones para fecha:', dateString);

        // Obtener transacciones normales
        const dayTransactions = this.transactions.filter(t => {
            // Asegurarse que la fecha de la transacción esté en el formato correcto
            const transactionDate = new Date(t.date).toISOString().split('T')[0];
            console.log('Comparando:', transactionDate, 'con', dateString);
            return transactionDate === dateString;
        });

        // Obtener pagos recurrentes para esta fecha
        const recurringForDay = this.recurringPayments.filter(payment => {
            return payment.dayOfMonth === date.getDate();
        });

        console.log('Transacciones encontradas:', dayTransactions);
        console.log('Pagos recurrentes encontrados:', recurringForDay);

        return [...dayTransactions, ...recurringForDay];
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