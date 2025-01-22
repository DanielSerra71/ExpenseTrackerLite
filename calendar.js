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
        this.checkPendingRecurringPayments();
        this.initializeControls();
        this.renderCalendar();

        // Debug: Mostrar el mes actual que estamos viendo
        console.log('Mes actual del calendario:', this.currentDate.toISOString());
    }

    loadData() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log('Usuario actual:', currentUser);

        if (currentUser) {
            // Cargar transacciones normales
            const storedTransactions = localStorage.getItem(`transactions_${currentUser.id}`);
            if (storedTransactions) {
                this.transactions = JSON.parse(storedTransactions);
            }

            // Cargar pagos recurrentes
            const storedRecurring = localStorage.getItem(`recurring_${currentUser.id}`);
            console.log('Pagos recurrentes almacenados:', storedRecurring); // Debug
            if (storedRecurring) {
                this.recurringPayments = JSON.parse(storedRecurring);
                console.log('Pagos recurrentes parseados:', this.recurringPayments); // Debug
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

            const dayTransactions = this.getTransactionsForDate(date);

            if (dayTransactions && dayTransactions.length > 0) {
                const transactionsContainer = document.createElement('div');
                transactionsContainer.className = 'day-transactions';

                dayTransactions.forEach(transaction => {
                    console.log('Tipo de transacción:', transaction);
                    console.log('¿Es recurrente?:', 'dayOfMonth' in transaction);
                    console.log('Tipo:', transaction.type);

                    const transactionDot = document.createElement('div');

                    if ('dayOfMonth' in transaction) {
                        const currentMonth = date.getMonth();
                        const currentYear = date.getFullYear();
                        const lastExecuted = transaction.lastExecuted ? new Date(transaction.lastExecuted) : null;

                        // Si ya se ejecutó este mes, mostrar en gris
                        if (lastExecuted &&
                            lastExecuted.getMonth() === currentMonth &&
                            lastExecuted.getFullYear() === currentYear) {
                            transactionDot.className = 'transaction-dot recurring processed';
                        }
                        // Si no se ha ejecutado y ya pasó la fecha, mostrar en azul y procesar
                        else if (date < new Date() && !transaction.lastExecuted) {
                            transactionDot.className = 'transaction-dot recurring completed';
                            this.addToTransactionHistory(transaction, date);
                        }
                        // Si es futuro, mostrar en amarillo
                        else {
                            transactionDot.className = 'transaction-dot recurring';
                        }
                    } else {
                        transactionDot.className = `transaction-dot ${transaction.type}`;
                    }

                    console.log('Clase final del dot:', transactionDot.className);

                    const amount = Math.abs(parseFloat(transaction.amount)).toFixed(2);

                    // Crear el tooltip
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
                                <span class="${transaction.type}">$${amount}</span>
                            </div>
                        </div>
                    `;

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
            const transactionDate = new Date(t.date).toISOString().split('T')[0];
            return transactionDate === dateString;
        });

        // Obtener pagos recurrentes para esta fecha
        const recurringForDay = this.recurringPayments.filter(payment => {
            return payment.dayOfMonth === date.getDate();
        });

        console.log('Transacciones encontradas:', dayTransactions);
        console.log('Pagos recurrentes encontrados:', recurringForDay);

        // Combinar ambos arrays
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

    renderDay(date) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');

        const dayNumber = document.createElement('span');
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);

        const transactions = this.getTransactionsForDate(date);
        const today = new Date();

        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.classList.add('transaction-indicators');

        transactions.forEach(transaction => {
            const indicator = document.createElement('div');

            // Crear el tooltip
            const tooltip = document.createElement('div');
            tooltip.classList.add('tooltip');

            const tooltipTitle = document.createElement('div');
            tooltipTitle.classList.add('tooltip-title');
            tooltipTitle.textContent = transaction.description;

            const tooltipContent = document.createElement('div');
            tooltipContent.classList.add('tooltip-content');
            tooltipContent.textContent = `$${transaction.amount}`;

            tooltip.appendChild(tooltipTitle);
            tooltip.appendChild(tooltipContent);

            if ('dayOfMonth' in transaction) {
                indicator.classList.add('transaction-indicator', 'recurring');
                // Verificar si el pago recurrente ya pasó este mes
                if (date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear() &&
                    date.getDate() < today.getDate()) {
                    indicator.classList.add('completed');
                }
            } else {
                indicator.classList.add(
                    'transaction-indicator',
                    transaction.type === 'income' ? 'income' : 'expense'
                );
            }

            indicator.appendChild(tooltip);
            indicatorsContainer.appendChild(indicator);
        });

        dayElement.appendChild(indicatorsContainer);
        return dayElement;
    }

    // Método nuevo para agregar al historial
    addToTransactionHistory(recurringPayment, date) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Obtener transacciones existentes
        let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.id}`)) || [];

        // Formatear la fecha para comparación
        const dateString = date.toISOString().split('T')[0];

        // Verificar si ya existe esta transacción recurrente para este mes
        const alreadyExists = transactions.some(t =>
            t.description === recurringPayment.description &&
            t.amount === recurringPayment.amount &&
            new Date(t.date).getMonth() === date.getMonth() &&
            new Date(t.date).getFullYear() === date.getFullYear()
        );

        // Solo agregar si no existe
        if (!alreadyExists) {
            // Crear la nueva transacción
            const newTransaction = {
                type: recurringPayment.type,
                description: recurringPayment.description,
                amount: recurringPayment.amount,
                category: recurringPayment.category,
                date: dateString,
                userId: currentUser.id
            };

            // Agregar la nueva transacción
            transactions.push(newTransaction);

            // Guardar en localStorage
            localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(transactions));

            // Marcar el pago recurrente como ejecutado
            recurringPayment.lastExecuted = dateString;

            // Actualizar pagos recurrentes en localStorage
            let recurringPayments = JSON.parse(localStorage.getItem(`recurring_${currentUser.id}`));
            const index = recurringPayments.findIndex(p => p.id === recurringPayment.id);
            if (index !== -1) {
                recurringPayments[index] = recurringPayment;
                localStorage.setItem(`recurring_${currentUser.id}`, JSON.stringify(recurringPayments));
            }
        }
    }

    // Nueva función para verificar pagos pendientes
    checkPendingRecurringPayments() {
        const today = new Date();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser) return;

        // Obtener pagos recurrentes
        const recurringPayments = JSON.parse(localStorage.getItem(`recurring_${currentUser.id}`)) || [];

        recurringPayments.forEach(payment => {
            // Verificar si el pago debe ejecutarse
            const lastExecuted = payment.lastExecuted ? new Date(payment.lastExecuted) : null;
            const shouldExecute = !lastExecuted ||
                (lastExecuted.getMonth() !== today.getMonth() ||
                    lastExecuted.getFullYear() !== today.getFullYear());

            // Si debe ejecutarse y ya pasó la fecha del mes actual
            if (shouldExecute && today.getDate() >= payment.dayOfMonth) {
                // Crear fecha de ejecución (día específico del mes actual)
                const executionDate = new Date(today.getFullYear(), today.getMonth(), payment.dayOfMonth);
                this.addToTransactionHistory(payment, executionDate);
            }
        });
    }
} 