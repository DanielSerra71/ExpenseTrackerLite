export const recurringPaymentManager = {
    elements: {
        modal: document.getElementById('recurringModal'),
        form: document.getElementById('recurringForm'),
        list: document.getElementById('recurringList'),
        addButton: document.getElementById('addRecurringBtn'),
        closeButtons: document.querySelectorAll('.close-modal')
    },

    init() {
        this.setupEventListeners();
        this.loadRecurringPayments();

        // Agregar event listener para el cambio de tipo
        document.getElementById('recurring-type').addEventListener('change', (e) => {
            this.updateCategoryOptions(e.target.value);
        });
    },

    setupEventListeners() {
        // Botón para agregar nuevo pago recurrente
        this.elements.addButton.addEventListener('click', () => {
            if (!currentUser) {
                showNotification('Error', 'Debe iniciar sesión para agregar pagos recurrentes', 'error');
                return;
            }
            this.elements.modal.style.display = 'block';
        });

        // Cerrar modal
        this.elements.closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    this.elements.form.reset();
                    this.elements.form.dataset.editId = '';
                }
            });
        });

        // Guardar pago recurrente
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
                if (e.target.id === 'recurringModal') {
                    this.elements.form.reset();
                    this.elements.form.dataset.editId = '';
                }
            }
        });
    },

    handleSubmit(e) {
        e.preventDefault();

        if (!currentUser) {
            showNotification('Error', 'Debe iniciar sesión para agregar pagos recurrentes', 'error');
            return;
        }

        const type = document.getElementById('recurring-type').value;
        const description = document.getElementById('recurring-description').value.trim();
        const amount = parseFloat(document.getElementById('recurring-amount').value);
        const category = document.getElementById('recurring-category').value;
        const dayOfMonth = parseInt(document.getElementById('recurring-day').value);

        if (!type || !description || !amount || !category || !dayOfMonth) {
            showNotification('Error', 'Por favor complete todos los campos', 'error');
            return;
        }

        if (dayOfMonth < 1 || dayOfMonth > 31) {
            showNotification('Error', 'Por favor ingrese un día válido del mes (1-31)', 'error');
            return;
        }

        const payment = {
            id: this.elements.form.dataset.editId ? parseInt(this.elements.form.dataset.editId) : Date.now(),
            userId: currentUser.id,
            type,
            description,
            amount,
            category,
            dayOfMonth,
            lastExecuted: null
        };

        this.saveRecurringPayment(payment);
    },

    saveRecurringPayment(payment) {
        const isEditing = recurringPayments.some(p => p.id === payment.id);

        if (isEditing) {
            const index = recurringPayments.findIndex(p => p.id === payment.id);
            payment.lastExecuted = recurringPayments[index].lastExecuted;
            recurringPayments[index] = payment;
        } else {
            recurringPayments.push(payment);
        }

        localStorage.setItem(`recurring_${currentUser.id}`, JSON.stringify(recurringPayments));
        this.updateRecurringList();

        this.elements.modal.style.display = 'none';
        this.elements.form.reset();
        this.elements.form.dataset.editId = '';

        showNotification(
            'Éxito',
            isEditing ? 'Pago recurrente actualizado' : 'Pago recurrente guardado',
            'success'
        );
    },

    loadRecurringPayments() {
        if (currentUser) {
            recurringPayments = JSON.parse(localStorage.getItem(`recurring_${currentUser.id}`)) || [];
            this.updateRecurringList();
        }
    },

    updateRecurringList() {
        if (!this.elements.list) return;

        this.elements.list.innerHTML = '';
        recurringPayments.forEach(payment => {
            const item = document.createElement('div');
            item.className = 'recurring-item';
            item.innerHTML = `
                <div class="recurring-info">
                    <strong>${payment.description}</strong>
                    <span>${payment.type === 'income' ? '+' : '-'}$${payment.amount.toFixed(2)}</span>
                    <small>Day ${payment.dayOfMonth} of each month</small>
                </div>
                <div class="recurring-actions">
                    <button class="action-button edit" onclick="window.recurringPaymentManager.editRecurringPayment(${payment.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-button delete" onclick="window.recurringPaymentManager.deleteRecurringPayment(${payment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.elements.list.appendChild(item);
        });
    },

    updateCategoryOptions(type) {
        const categorySelect = document.getElementById('recurring-category');
        categorySelect.innerHTML = '<option value="">Select category</option>';

        if (type === 'income') {
            categorySelect.innerHTML += `
                <option value="salary">${translations['en'].salary}</option>
                <option value="business">${translations['en'].business}</option>
                <option value="investments">${translations['en'].investments}</option>
                <option value="extras">${translations['en'].extras}</option>
            `;
        } else if (type === 'expense') {
            categorySelect.innerHTML += `
                <option value="housing">${translations['en'].housing}</option>
                <option value="food">${translations['en'].food}</option>
                <option value="transport">${translations['en'].transport}</option>
                <option value="services">${translations['en'].services}</option>
                <option value="entertainment">${translations['en'].entertainment}</option>
                <option value="healthcare">${translations['en'].healthcare}</option>
                <option value="education">${translations['en'].education}</option>
                <option value="shopping">${translations['en'].shopping}</option>
            `;
        }
    },

    editRecurringPayment(id) {
        const payment = recurringPayments.find(p => p.id === id);
        if (!payment) return;

        // Llenar el formulario con los datos del pago
        const typeSelect = document.getElementById('recurring-type');
        const descriptionInput = document.getElementById('recurring-description');
        const amountInput = document.getElementById('recurring-amount');
        const categorySelect = document.getElementById('recurring-category');
        const dayInput = document.getElementById('recurring-day');

        typeSelect.value = payment.type;
        this.updateCategoryOptions(payment.type);
        descriptionInput.value = payment.description;
        amountInput.value = payment.amount;
        categorySelect.value = payment.category;
        dayInput.value = payment.dayOfMonth;

        // Marcar que estamos editando
        this.elements.form.dataset.editId = id;

        // Mostrar el modal
        this.elements.modal.style.display = 'block';
    },

    deleteRecurringPayment(id) {
        const confirmationModal = document.getElementById('confirmationModal');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmAction = document.getElementById('confirmAction');
        const cancelConfirmation = document.getElementById('cancelConfirmation');

        confirmationMessage.textContent = 'Are you sure you want to delete this recurring payment?';
        confirmationModal.style.display = 'block';

        confirmAction.onclick = () => {
            const index = recurringPayments.findIndex(p => p.id === id);
            if (index !== -1) {
                recurringPayments.splice(index, 1);
                localStorage.setItem(`recurring_${currentUser.id}`, JSON.stringify(recurringPayments));
                this.updateRecurringList();
                window.showNotification(
                    'Success',
                    'Recurring payment deleted successfully',
                    'success'
                );
            }
            confirmationModal.style.display = 'none';
        };

        cancelConfirmation.onclick = () => {
            confirmationModal.style.display = 'none';
        };
    }
}; 