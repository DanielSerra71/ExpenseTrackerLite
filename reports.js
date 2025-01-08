class FinancialReports {
    constructor() {
        this.charts = {};
        this.transactions = this.loadTransactions();
        this.translations = {
            es: {
                // Títulos de gráficos
                expensesByCategory: 'Gastos por Categoría',
                monthlyComparison: 'Comparativa Mensual',
                savingsProjection: 'Proyección de Ahorro',
                
                // Etiquetas de datos
                income: 'Ingresos',
                expenses: 'Gastos',
                savings: 'Ahorros',
                
                // Categorías
                housing: 'Vivienda',
                food: 'Alimentación',
                transport: 'Transporte',
                services: 'Servicios',
                entertainment: 'Entretenimiento',
                healthcare: 'Salud',
                education: 'Educación',
                shopping: 'Compras',
                
                // Meses
                months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                
                // Estadísticas
                statisticsSummary: 'Resumen Estadístico',
                totalExpenses: 'Total Gastos',
                dailyAverage: 'Promedio Diario',
                savingsRate: 'Tasa de Ahorro',
                
                // Recomendaciones
                recommendations: 'Recomendaciones',
                highExpenseWarning: 'El gasto diario promedio excede el presupuesto',
                reduceExpenses: 'Considere reducir gastos en categorías no esenciales',
                lowSavingsWarning: 'La tasa de ahorro está por debajo del objetivo del 20%',
                increaseSavings: 'Considere establecer un presupuesto más estricto'
            },
            en: {
                // Chart titles
                expensesByCategory: 'Expenses by Category',
                monthlyComparison: 'Monthly Comparison',
                savingsProjection: 'Savings Projection',
                
                // Data labels
                income: 'Income',
                expenses: 'Expenses',
                savings: 'Savings',
                
                // Categories
                housing: 'Housing',
                food: 'Food',
                transport: 'Transport',
                services: 'Services',
                entertainment: 'Entertainment',
                healthcare: 'Healthcare',
                education: 'Education',
                shopping: 'Shopping',
                
                // Months
                months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                
                // Statistics
                statisticsSummary: 'Statistical Summary',
                totalExpenses: 'Total Expenses',
                dailyAverage: 'Daily Average',
                savingsRate: 'Savings Rate',
                
                // Recommendations
                recommendations: 'Recommendations',
                highExpenseWarning: 'Daily average expense exceeds budget',
                reduceExpenses: 'Consider reducing expenses in non-essential categories',
                lowSavingsWarning: 'Savings rate is below the 20% target',
                increaseSavings: 'Consider setting a stricter budget'
            }
        };
        this.initializeCharts();
    }

    getCurrentLanguage() {
        return 'en';
    }

    translate(key) {
        const lang = this.getCurrentLanguage();
        return this.translations[lang][key] || key;
    }

    loadTransactions() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return [];
        
        const transactions = localStorage.getItem(`transactions_${currentUser.id}`);
        return transactions ? JSON.parse(transactions) : [];
    }

    initializeCharts() {
        // Inicializar gráficos principales
        this.createExpensesByCategoryChart();
        this.createMonthlyComparisonChart();
        this.createSavingsProjectionChart();
    }

    createExpensesByCategoryChart() {
        const ctx = document.getElementById('expensesByCategoryChart').getContext('2d');
        this.charts.expensesByCategory = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#4BC0C0', '#FF6384'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    title: {
                        display: true,
                        text: this.translate('expensesByCategory'),
                        font: { size: 16 }
                    }
                },
                layout: {
                    padding: 20
                },
                cutout: '60%'
            }
        });
    }

    createMonthlyComparisonChart() {
        const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
        this.charts.monthlyComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [], // Se llenarán con los meses
                datasets: [{
                    label: this.translate('income'),
                    backgroundColor: '#2ecc71',
                    data: []
                }, {
                    label: this.translate('expenses'),
                    backgroundColor: '#e74c3c',
                    data: []
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: this.translate('monthlyComparison')
                    }
                }
            }
        });
    }

    createSavingsProjectionChart() {
        const ctx = document.getElementById('savingsProjectionChart').getContext('2d');
        this.charts.savingsProjection = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Se llenarán con los meses futuros
                datasets: [{
                    label: this.translate('savings'),
                    borderColor: '#3498db',
                    data: []
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: this.translate('savingsProjection')
                    }
                }
            }
        });
    }

    async generateMonthlyReport() {
        try {
            const data = await this.collectMonthlyData();
            
            // Actualizar gráficos
            this.updateExpensesByCategoryChart(data.expenses);
            this.updateMonthlyComparisonChart(data.comparison);
            this.updateSavingsProjectionChart(data.savings);

            // Generar resumen estadístico
            const statistics = this.calculateStatistics(data);
            this.displayStatistics(statistics);

            // Generar recomendaciones
            const recommendations = this.generateRecommendations(statistics);
            this.displayRecommendations(recommendations);

            return {
                success: true,
                statistics,
                recommendations
            };
        } catch (error) {
            console.error('Error generando reporte mensual:', error);
            throw new Error('No se pudo generar el reporte mensual');
        }
    }

    async collectMonthlyData() {
        // Recolectar datos del mes actual
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        return {
            expenses: await this.getExpensesByCategory(firstDay, lastDay),
            comparison: await this.getMonthlyComparison(),
            savings: await this.getSavingsData()
        };
    }

    calculateStatistics(data) {
        return {
            totalExpenses: this.calculateTotal(data.expenses),
            averageDailyExpense: this.calculateAverageDailyExpense(data.expenses),
            topExpenseCategories: this.getTopExpenseCategories(data.expenses),
            savingsRate: this.calculateSavingsRate(data),
            monthOverMonthChange: this.calculateMonthlyChange(data.comparison)
        };
    }

    generateRecommendations(statistics) {
        const recommendations = [];
        if (statistics.averageDailyExpense > statistics.averageDailyBudget) {
            recommendations.push({
                type: 'warning',
                messageKey: 'highExpenseWarning',
                actionKey: 'reduceExpenses'
            });
        }
        if (statistics.savingsRate < 0.2) {
            recommendations.push({
                type: 'suggestion',
                messageKey: 'lowSavingsWarning',
                actionKey: 'increaseSavings'
            });
        }
        return recommendations;
    }

    async generatePDFReport() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Calcular dimensiones óptimas
            const margin = 20;
            const usableWidth = pageWidth - (margin * 2);
            const usableHeight = pageHeight - (margin * 2);

            // Primera página: Título y gráfico circular
            doc.setFontSize(20);
            doc.text('Financial Reports', margin, margin);
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, margin, margin + 10);

            // Gráfico de gastos por categoría (circular)
            const chart1 = this.charts.expensesByCategory.toBase64Image();
            const donutSize = Math.min(usableWidth * 0.5, usableHeight * 0.5);
            const centerX = (pageWidth - (donutSize * 2.5)) / 2;
            const centerY = margin + ((usableHeight - donutSize) / 2);
            doc.addImage(chart1, 'PNG', centerX, centerY, donutSize * 2.5, donutSize);
            doc.setFontSize(16);
            doc.text('Expenses by Category', centerX, centerY - 10);

            // Segunda página: Gráfico de comparación mensual
            doc.addPage();
            const chart2 = this.charts.monthlyComparison.toBase64Image();
            const barWidth = usableWidth * 0.8;
            const barHeight = usableHeight * 0.6;
            const barX = (pageWidth - barWidth) / 2;
            const barY = (pageHeight - barHeight) / 2;
            doc.setFontSize(16);
            doc.text('Monthly Comparison', barX, barY - 20);
            doc.addImage(chart2, 'PNG', barX, barY, barWidth, barHeight);

            // Tercera página: Gráfico de proyección
            doc.addPage();
            const chart3 = this.charts.savingsProjection.toBase64Image();
            const projWidth = usableWidth * 0.8;
            const projHeight = usableHeight * 0.6;
            const projX = (pageWidth - projWidth) / 2;
            const projY = (pageHeight - projHeight) / 2;
            doc.setFontSize(16);
            doc.text('Savings Projection', projX, projY - 10);
            doc.addImage(chart3, 'PNG', projX, projY, projWidth, projHeight);

            // Cuarta página: Resumen estadístico
            doc.addPage();
            doc.setFontSize(18);
            doc.text(this.translate('statisticsSummary'), margin, margin);

            // Obtener datos actuales
            const data = await this.collectMonthlyData();
            const statistics = this.calculateStatistics(data);

            // Agregar estadísticas
            doc.setFontSize(12);
            let yPos = margin + 20;
            const lineHeight = 10;

            // Formatear y agregar cada estadística
            doc.text(`Total Expenses: $${statistics.totalExpenses.toFixed(2)}`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Daily Average: $${statistics.averageDailyExpense.toFixed(2)}`, margin, yPos);
            yPos += lineHeight;
            doc.text(`Savings Rate: ${(statistics.savingsRate * 100).toFixed(2)}%`, margin, yPos);
            yPos += lineHeight * 2;

            // Agregar recomendaciones
            doc.setFontSize(16);
            doc.text('Recommendations', margin, yPos);
            yPos += lineHeight * 1.5;
            
            doc.setFontSize(12);
            const recommendations = this.generateRecommendations(statistics);
            recommendations.forEach((rec, index) => {
                const text = `• ${this.translate(rec.messageKey)}`;
                const action = this.translate(rec.actionKey);
                doc.text(text, margin, yPos + (index * lineHeight * 2));
                doc.setFontSize(10);
                doc.text(action, margin + 5, yPos + (index * lineHeight * 2) + lineHeight);
                doc.setFontSize(12);
            });

            // Guardar el PDF
            const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            return true;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Could not generate PDF');
        }
    }

    // Métodos auxiliares
    chartToImage(chart) {
        return new Promise((resolve) => {
            const image = new Image();
            image.src = chart.toBase64Image();
            image.onload = () => resolve(image);
        });
    }

    displayStatistics(statistics) {
        const container = document.getElementById('statisticsContainer');
        container.innerHTML = `
            <div class="statistics-card">
                <h3>${this.translate('statisticsSummary')}</h3>
                <div class="stat-item">
                    <span>${this.translate('totalExpenses')}:</span>
                    <span>$${statistics.totalExpenses.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span>${this.translate('dailyAverage')}:</span>
                    <span>$${statistics.averageDailyExpense.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span>${this.translate('savingsRate')}:</span>
                    <span>${(statistics.savingsRate * 100).toFixed(2)}%</span>
                </div>
            </div>
        `;
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsContainer');
        container.innerHTML = `
            <div class="recommendations-card">
                <h3>${this.translate('recommendations')}</h3>
                ${recommendations.map(rec => `
                    <div class="recommendation-item ${rec.type}">
                        <i class="fas fa-${rec.type === 'warning' ? 'exclamation-triangle' : 'lightbulb'}"></i>
                        <div>
                            <p>${this.translate(rec.messageKey)}</p>
                            <small>${this.translate(rec.actionKey)}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async getExpensesByCategory(startDate, endDate) {
        const expenses = this.transactions
            .filter(t => t.type === 'expense' && 
                        new Date(t.date) >= startDate && 
                        new Date(t.date) <= endDate);

        // Agrupar por categoría
        const categoryTotals = expenses.reduce((acc, transaction) => {
            if (!acc[transaction.category]) {
                acc[transaction.category] = 0;
            }
            acc[transaction.category] += transaction.amount;
            return acc;
        }, {});

        // Convertir a array de objetos
        return Object.entries(categoryTotals).map(([category, amount]) => ({
            category,
            amount
        }));
    }

    async getMonthlyComparison() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentDate = new Date();
        const lastSixMonths = Array.from({length: 6}, (_, i) => {
            const d = new Date(currentDate);
            d.setMonth(d.getMonth() - i);
            return d;
        }).reverse();

        const monthlyData = lastSixMonths.map(date => {
            const month = date.getMonth();
            const year = date.getFullYear();
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const monthTransactions = this.transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= startDate && tDate <= endDate;
            });

            return {
                label: months[month],
                income: monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0),
                expense: monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
            };
        });

        return {
            labels: monthlyData.map(d => d.label),
            income: monthlyData.map(d => d.income),
            expenses: monthlyData.map(d => d.expense)
        };
    }

    async getSavingsData() {
        const monthlyData = await this.getMonthlyComparison();
        const savings = monthlyData.income.map((income, i) => income - monthlyData.expenses[i]);
        
        // Proyección para los próximos 6 meses
        const avgSaving = savings.reduce((a, b) => a + b, 0) / savings.length;
        const projected = Array.from({length: 6}, (_, i) => avgSaving * (i + 1));

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();
        const futureMonths = Array.from({length: 6}, (_, i) => months[(currentMonth + i + 1) % 12]);

        return {
            labels: futureMonths,
            projected: projected
        };
    }

    updateExpensesByCategoryChart(expenses) {
        const labels = expenses.map(item => item.category);
        const data = expenses.map(item => item.amount);

        this.charts.expensesByCategory.data.labels = labels;
        this.charts.expensesByCategory.data.datasets[0].data = data;
        this.charts.expensesByCategory.update();
    }

    updateMonthlyComparisonChart(data) {
        this.charts.monthlyComparison.data.labels = data.labels;
        this.charts.monthlyComparison.data.datasets[0].data = data.income;
        this.charts.monthlyComparison.data.datasets[1].data = data.expenses;
        this.charts.monthlyComparison.update();
    }

    updateSavingsProjectionChart(data) {
        this.charts.savingsProjection.data.labels = data.labels;
        this.charts.savingsProjection.data.datasets[0].data = data.projected;
        this.charts.savingsProjection.update();
    }

    calculateTotal(expenses) {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    }

    calculateAverageDailyExpense(expenses) {
        const total = this.calculateTotal(expenses);
        return total / 30; // Asumiendo un mes de 30 días
    }

    calculateSavingsRate(data) {
        const totalIncome = data.comparison.income.reduce((a, b) => a + b, 0);
        const totalExpenses = data.comparison.expenses.reduce((a, b) => a + b, 0);
        return (totalIncome - totalExpenses) / totalIncome;
    }

    getTopExpenseCategories(expenses) {
        return [...expenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
    }

    calculateMonthlyChange(comparison) {
        const currentMonth = comparison.expenses.length - 1;
        const previousMonth = currentMonth - 1;
        if (previousMonth < 0) return 0;

        return (comparison.expenses[currentMonth] - comparison.expenses[previousMonth]) 
               / comparison.expenses[previousMonth];
    }

    // Agregar un método para actualizar las traducciones
    updateChartTranslations() {
        if (this.charts.expensesByCategory) {
            this.charts.expensesByCategory.options.plugins.title.text = this.translate('expensesByCategory');
            this.charts.expensesByCategory.update();
        }
        if (this.charts.monthlyComparison) {
            this.charts.monthlyComparison.options.plugins.title.text = this.translate('monthlyComparison');
            this.charts.monthlyComparison.data.datasets[0].label = this.translate('income');
            this.charts.monthlyComparison.data.datasets[1].label = this.translate('expenses');
            this.charts.monthlyComparison.update();
        }
        if (this.charts.savingsProjection) {
            this.charts.savingsProjection.options.plugins.title.text = this.translate('savingsProjection');
            this.charts.savingsProjection.data.datasets[0].label = this.translate('savings');
            this.charts.savingsProjection.update();
        }
    }
}

function showNotification(title, message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(notification);

    // Forzar un reflow para que la animación funcione
    notification.offsetHeight;

    // Mostrar la notificación
    notification.classList.add('show');

    // Eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

// Inicializar y manejar cambios de idioma
document.addEventListener('DOMContentLoaded', () => {
    const reports = new FinancialReports();
    reports.generateMonthlyReport();

    // Agregar event listener para el botón de PDF
    document.getElementById('generatePDFBtn').addEventListener('click', async () => {
        try {
            await reports.generatePDFReport();
            const isSpanish = reports.getCurrentLanguage() === 'es';
            showNotification(
                isSpanish ? 'PDF Generado' : 'PDF Generated',
                isSpanish ? 'El reporte se ha generado exitosamente' : 'The report has been successfully generated',
                'success'
            );
        } catch (error) {
            const isSpanish = reports.getCurrentLanguage() === 'es';
            showNotification(
                isSpanish ? 'Error' : 'Error',
                isSpanish ? 'Error al generar el PDF' : 'Error generating PDF',
                'error'
            );
        }
    });

    // Actualizar gráficos cuando cambie el idioma
    document.addEventListener('languageChanged', () => {
        reports.updateChartTranslations();
        reports.generateMonthlyReport();
    });
}); 