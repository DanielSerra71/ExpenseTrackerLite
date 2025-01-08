class SmartBudgetUI {
    constructor(smartBudget) {
        this.smartBudget = smartBudget;
        this.stats = null;
        
        // Suscribirse a cambios en SmartBudget
        this.smartBudget.subscribe((stats) => {
            this.stats = stats;
            this.updateUI();
        });
    }

    updateUI() {
        console.log('Actualizando UI con stats:', this.stats);
        
        // Actualizar estadísticas básicas
        const stats = this.stats || this.smartBudget.calculateStats();
        
        // Actualizar valores en la UI
        document.querySelector('.total-expenses').textContent = 
            `$${stats.totalExpenses.toFixed(2)}`;
        
        document.querySelector('.monthly-average').textContent = 
            `$${stats.monthlyAverage.toFixed(2)}`;
        
        document.querySelector('.savings-potential').textContent = 
            `$${stats.savingsPotential.toFixed(2)}`;

        // Actualizar presupuesto sugerido
        this.updateSuggestedBudget(stats);
        
        // Actualizar recomendaciones
        this.updateRecommendations(stats);
    }

    updateSuggestedBudget(stats) {
        const suggestedBudgetContainer = document.querySelector('.suggested-budget');
        suggestedBudgetContainer.innerHTML = `
            <h3><i class="fas fa-chart-pie"></i> Suggested Budget</h3>
            <div class="budget-categories">
                <div class="budget-category">
                    <h4>Basic Needs (50%)</h4>
                    <p>$${(stats.monthlyIncome * 0.5).toFixed(2)}</p>
                </div>
                <div class="budget-category">
                    <h4>Wants (30%)</h4>
                    <p>$${(stats.monthlyIncome * 0.3).toFixed(2)}</p>
                </div>
                <div class="budget-category">
                    <h4>Savings (20%)</h4>
                    <p>$${(stats.monthlyIncome * 0.2).toFixed(2)}</p>
                </div>
            </div>
        `;
    }

    updateRecommendations(stats) {
        const recommendationsContainer = document.querySelector('.smart-budget-recommendations');
        let recommendations = '<h3><i class="fas fa-lightbulb"></i> Personalized Recommendations</h3><ul class="recommendations-list">';

        // Expenses vs Income Analysis
        if (stats.monthlyExpenses > stats.monthlyIncome) {
            recommendations += `
                <li class="warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="recommendation-content">
                        <strong>Excessive Spending Alert</strong>
                        <p>Your monthly expenses ($${stats.monthlyExpenses.toFixed(2)}) 
                        exceed your income ($${stats.monthlyIncome.toFixed(2)})</p>
                        <p>Consider reducing non-essential expenses or finding additional income sources.</p>
                    </div>
                </li>
            `;
        }

        // Savings Analysis
        const recommendedSavings = stats.monthlyIncome * 0.2;
        const currentSavings = stats.savingsPotential;
        const savingsPercentage = (currentSavings / stats.monthlyIncome) * 100;

        if (currentSavings < recommendedSavings) {
            recommendations += `
                <li class="info">
                    <i class="fas fa-piggy-bank"></i>
                    <div class="recommendation-content">
                        <strong>Savings Optimization</strong>
                        <p>Your current savings are ${savingsPercentage.toFixed(1)}% of your income.</p>
                        <p>Recommendation: Try to reach 20% ($${recommendedSavings.toFixed(2)}) for better financial health.</p>
                    </div>
                </li>
            `;
        }

        // Expense Distribution Analysis
        const basicNeedsExpenses = stats.monthlyIncome * 0.5;
        if (stats.monthlyExpenses > basicNeedsExpenses) {
            recommendations += `
                <li class="warning">
                    <i class="fas fa-chart-pie"></i>
                    <div class="recommendation-content">
                        <strong>Expense Distribution</strong>
                        <p>Your monthly expenses exceed the recommended 50% for basic needs.</p>
                        <p>Consider following the 50/30/20 rule:</p>
                        <ul>
                            <li>50% for basic needs ($${basicNeedsExpenses.toFixed(2)})</li>
                            <li>30% for discretionary spending ($${(stats.monthlyIncome * 0.3).toFixed(2)})</li>
                            <li>20% for savings ($${(stats.monthlyIncome * 0.2).toFixed(2)})</li>
                        </ul>
                    </div>
                </li>
            `;
        }

        // Emergency Fund Recommendation
        if (currentSavings < stats.monthlyExpenses * 3) {
            recommendations += `
                <li class="info">
                    <i class="fas fa-shield-alt"></i>
                    <div class="recommendation-content">
                        <strong>Emergency Fund</strong>
                        <p>It's recommended to have an emergency fund equivalent to 3-6 months of expenses.</p>
                        <p>Suggested target: $${(stats.monthlyExpenses * 3).toFixed(2)}</p>
                    </div>
                </li>
            `;
        }

        // If no specific recommendations
        if (recommendations === '<h3><i class="fas fa-lightbulb"></i> Personalized Recommendations</h3><ul class="recommendations-list">') {
            recommendations += `
                <li class="success">
                    <i class="fas fa-check-circle"></i>
                    <div class="recommendation-content">
                        <strong>Excellent Financial Management!</strong>
                        <p>You're managing your finances well. Keep up the good financial habits.</p>
                    </div>
                </li>
            `;
        }

        recommendations += '</ul>';
        recommendationsContainer.innerHTML = recommendations;
    }
}

export default SmartBudgetUI; 