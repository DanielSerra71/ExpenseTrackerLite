export const transactionManager = {
    elements: {
        form: document.getElementById('form'),
        typeSelect: document.getElementById('transaction-type'),
        presetSelect: document.getElementById('preset-transactions'),
        descriptionInput: document.getElementById('description'),
        amountInput: document.getElementById('amount'),
        categorySelect: document.getElementById('category'),
        dateInput: document.getElementById('transaction-date'),
        savePresetBtn: document.getElementById('save-preset')
    },

    init() {
        this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.elements.typeSelect.addEventListener('change', this.handleTypeChange.bind(this));
        this.elements.presetSelect.addEventListener('change', this.handlePresetChange.bind(this));
        this.elements.savePresetBtn.addEventListener('click', this.handleSavePreset.bind(this));
    },

    handleSubmit(e) {
        e.preventDefault();
        const currentLang = document.documentElement.getAttribute('data-lang') || 'es';

        const transaction = {
            type: this.elements.typeSelect.value,
            description: this.elements.descriptionInput.value.trim(),
            amount: parseFloat(this.elements.amountInput.value),
            category: this.elements.categorySelect.value,
            date: this.elements.dateInput.value
        };

        if (!transaction.type || !transaction.description || !transaction.amount || !transaction.category) {
            window.showNotification(
                window.translations[currentLang].error,
                window.translations[currentLang].fillAllFields,
                'error'
            );
            return;
        }

        const editId = this.elements.form.dataset.editId;
        if (editId) {
            // Modo edición
            transaction.id = parseInt(editId);
            const index = window.transactions.findIndex(t => t.id === transaction.id);
            if (index !== -1) {
                window.transactions[index] = transaction;
                delete this.elements.form.dataset.editId;
            }
        } else {
            // Modo nueva transacción
            transaction.id = Date.now();
            window.transactions.push(transaction);
        }

        this.elements.form.reset();
        window.updateUI();

        window.showNotification(
            window.translations[currentLang].success,
            editId ? window.translations[currentLang].transactionUpdated : window.translations[currentLang].transactionSaved,
            'success'
        );
    },

    handleTypeChange() {
        const type = this.elements.typeSelect.value;
        const currentLang = document.documentElement.getAttribute('data-lang') || 'es';

        // Limpiar campos si es necesario
        if (!this.elements.form.dataset.editId) {
            this.elements.descriptionInput.value = '';
            this.elements.amountInput.value = '';
        }

        // Si no hay tipo seleccionado, deshabilitar otros campos
        const fieldsToToggle = [
            this.elements.presetSelect,
            this.elements.descriptionInput,
            this.elements.amountInput,
            this.elements.categorySelect,
            this.elements.savePresetBtn
        ];

        if (!type) {
            fieldsToToggle.forEach(field => field.disabled = true);
            return;
        } else {
            fieldsToToggle.forEach(field => field.disabled = false);
        }

        // Actualizar opciones según el tipo
        this.updateCategoryOptions(type);
        this.updatePresetOptions(type);

        // Mostrar mensaje de ayuda
        const helpText = type === 'income' ?
            window.translations[currentLang].incomeHelp :
            window.translations[currentLang].expenseHelp;

        // Aquí podrías mostrar el mensaje de ayuda en algún elemento de la UI si lo deseas
    },

    handlePresetChange() {
        const selectedPreset = this.elements.presetSelect.value;
        const type = this.elements.typeSelect.value;

        if (selectedPreset && window.presetTransactions[type][selectedPreset]) {
            const preset = window.presetTransactions[type][selectedPreset];
            this.elements.descriptionInput.value = preset.description;
            this.elements.categorySelect.value = preset.category;
            if (preset.amount > 0) {
                this.elements.amountInput.value = preset.amount;
            }
        }
    },

    handleSavePreset() {
        const currentLang = document.documentElement.getAttribute('data-lang') || 'es';
        const type = this.elements.typeSelect.value;
        const description = this.elements.descriptionInput.value.trim();
        const amount = parseFloat(this.elements.amountInput.value);
        const category = this.elements.categorySelect.value;

        if (!type || !description || !category) {
            window.showNotification(
                window.translations[currentLang].error,
                window.translations[currentLang].fillRequiredFields,
                'error'
            );
            return;
        }

        const preset = {
            description,
            category,
            amount: amount || 0,
            type
        };

        const presetKey = description.toLowerCase().replace(/\s+/g, '-');
        window.presetTransactions[type][presetKey] = preset;

        // Guardar en localStorage
        if (window.currentUser) {
            localStorage.setItem(
                `presets_${window.currentUser.id}`,
                JSON.stringify(window.presetTransactions)
            );
        }

        // Actualizar lista de presets
        this.updatePresetOptions(type);

        window.showNotification(
            window.translations[currentLang].success,
            window.translations[currentLang].presetSaved,
            'success'
        );
    },

    updateCategoryOptions(type) {
        const currentLang = 'en';
        const categorySelect = this.elements.categorySelect;
        categorySelect.innerHTML = `<option value="">${window.translations[currentLang].selectCategory}</option>`;

        if (type === 'income') {
            categorySelect.innerHTML += `
                <option value="income-header" disabled style="font-weight: bold; background-color: var(--bg-color)">
                    ${window.translations[currentLang].incomeCategories}
                </option>
                <option value="salary">${window.translations[currentLang].salary}</option>
                <option value="business">${window.translations[currentLang].business}</option>
                <option value="investments">${window.translations[currentLang].investments}</option>
                <option value="extras">${window.translations[currentLang].extras}</option>
            `;
        } else if (type === 'expense') {
            categorySelect.innerHTML += `
                <option value="expense-header" disabled style="font-weight: bold; background-color: var(--bg-color)">
                    ${window.translations[currentLang].expenseCategories}
                </option>
                <option value="housing">${window.translations[currentLang].housing}</option>
                <option value="food">${window.translations[currentLang].food}</option>
                <option value="transport">${window.translations[currentLang].transport}</option>
                <option value="services">${window.translations[currentLang].services}</option>
                <option value="entertainment">${window.translations[currentLang].entertainment}</option>
                <option value="healthcare">${window.translations[currentLang].healthcare}</option>
                <option value="education">${window.translations[currentLang].education}</option>
                <option value="shopping">${window.translations[currentLang].shopping}</option>
            `;
        }
    },

    updatePresetOptions(type) {
        const currentLang = 'en';
        const presetSelect = this.elements.presetSelect;
        presetSelect.innerHTML = `<option value="">${window.translations[currentLang].selectOrCreate}</option>`;

        // Agregar presets predefinidos
        if (type === 'income') {
            presetSelect.innerHTML += `
                <option value="income-presets-header" disabled style="font-weight: bold; background-color: var(--bg-color)">
                    ${window.translations[currentLang].frequentIncomes}
                </option>
                <option value="salary">${window.translations[currentLang].salary}</option>
                <option value="freelance">${window.translations[currentLang].freelance}</option>
                <option value="investments">${window.translations[currentLang].investments}</option>
                <option value="rent">${window.translations[currentLang].rent}</option>
                <option value="bonus">${window.translations[currentLang].bonus}</option>
            `;
        } else if (type === 'expense') {
            presetSelect.innerHTML += `
                <option value="expense-presets-header" disabled style="font-weight: bold; background-color: var(--bg-color)">
                    ${window.translations[currentLang].frequentExpenses}
                </option>
                <option value="rent-expense">${window.translations[currentLang].rentExpense}</option>
                <option value="utilities">${window.translations[currentLang].utilities}</option>
                <option value="groceries">${window.translations[currentLang].groceries}</option>
                <option value="transport">${window.translations[currentLang].transport}</option>
                <option value="internet">${window.translations[currentLang].internet}</option>
                <option value="entertainment">${window.translations[currentLang].entertainment}</option>
                <option value="healthcare">${window.translations[currentLang].healthcare}</option>
                <option value="clothing">${window.translations[currentLang].clothing}</option>
                <option value="restaurants">${window.translations[currentLang].restaurants}</option>
            `;
        }

        // Agregar presets guardados por el usuario
        const userPresets = window.presetTransactions[type];
        if (Object.keys(userPresets).length > 0) {
            presetSelect.innerHTML += `
                <option value="user-presets-header" disabled style="font-weight: bold; background-color: var(--bg-color)">
                    ${window.translations[currentLang].savedPresets || 'Presets Guardados'}
                </option>
            `;

            for (const [key, preset] of Object.entries(userPresets)) {
                presetSelect.innerHTML += `
                    <option value="${key}">${preset.description}</option>
                `;
            }
        }
    }
}; 