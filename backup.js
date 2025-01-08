document.addEventListener('DOMContentLoaded', () => {
    const exportJsonBtn = document.getElementById('exportJson');
    const exportCsvBtn = document.getElementById('exportCsv');
    const restoreBtn = document.getElementById('restoreBtn');
    const restoreFile = document.getElementById('restoreFile');

    // Event listeners para exportar
    exportJsonBtn.addEventListener('click', () => createBackup('json'));
    exportCsvBtn.addEventListener('click', () => createBackup('csv'));

    // Restaurar desde archivo
    restoreBtn.addEventListener('click', () => {
        restoreFile.click();
    });

    restoreFile.addEventListener('change', handleRestore);
});

// Función para convertir JSON a CSV
function jsonToCSV(transactions) {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'es';
    const csvColumns = [
        translations[currentLang].date,
        translations[currentLang].type,
        translations[currentLang].description,
        translations[currentLang].category,
        translations[currentLang].amount
    ];

    let csvContent = csvColumns.join(',') + '\n';

    transactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        const type = transaction.type === 'income' ?
            translations[currentLang].income :
            translations[currentLang].expense;
        const description = `"${transaction.description.replace(/"/g, '""')}"`;
        const row = [
            date,
            type,
            description,
            transaction.category,
            transaction.amount
        ].join(',');
        csvContent += row + '\n';
    });

    return csvContent;
}

// Función para crear backup
function createBackup(format = 'json') {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'es';

    if (!currentUser) {
        showNotification(
            translations[currentLang].error,
            translations[currentLang].loginRequired,
            'error'
        );
        return;
    }

    try {
        const data = {
            transactions: transactions,
            recurringPayments: recurringPayments,
            userPreferences: {
                theme: localStorage.getItem('theme'),
                language: localStorage.getItem('language')
            },
            backupDate: new Date().toISOString()
        };

        let content;
        let filename;
        let type;

        if (format === 'csv') {
            content = jsonToCSV(transactions);
            filename = `${translations[currentLang].expenses}_${new Date().toISOString().split('T')[0]}.csv`;
            type = 'text/csv';
        } else {
            content = JSON.stringify(data, null, 2);
            filename = `backup_${new Date().toISOString().split('T')[0]}.json`;
            type = 'application/json';
        }

        const blob = new Blob([content], { type: `${type};charset=utf-8;` });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        showNotification(
            translations[currentLang].success,
            translations[currentLang].backupCreated.replace('{format}', format.toUpperCase()),
            'success'
        );
    } catch (error) {
        console.error('Error al crear backup:', error);
        showNotification(
            translations[currentLang].error,
            translations[currentLang].backupError,
            'error'
        );
    }
}

// Función para manejar la restauración
function handleRestore(e) {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'es';

    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const data = JSON.parse(event.target.result);
            if (data.transactions) {
                transactions = data.transactions;
                recurringPayments = data.recurringPayments || [];
                localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(transactions));
                localStorage.setItem(`recurring_${currentUser.id}`, JSON.stringify(recurringPayments));

                if (data.userPreferences) {
                    localStorage.setItem('theme', data.userPreferences.theme);
                    localStorage.setItem('language', data.userPreferences.language);
                }

                location.reload();
                showNotification(
                    translations[currentLang].success,
                    translations[currentLang].backupRestored,
                    'success'
                );
            }
        } catch (error) {
            console.error('Error al restaurar:', error);
            showNotification(
                translations[currentLang].error,
                translations[currentLang].restoreError,
                'error'
            );
        }
    };

    reader.readAsText(file);
} 