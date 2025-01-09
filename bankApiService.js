class BankApiService {
    constructor() {
        this.mockBankData = {
            'Chase': {
                validCredentials: { username: 'demo_chase', password: 'chase123' },
                accounts: [
                    {
                        id: 'ch001',
                        type: 'checking',
                        name: 'Chase Freedom Checking',
                        balance: 2500.00,
                        transactions: [
                            {
                                id: 'tx001',
                                date: '2024-03-15',
                                description: 'Grocery Store',
                                amount: -85.50,
                                category: 'food'
                            },
                            {
                                id: 'tx002',
                                date: '2024-03-14',
                                description: 'Monthly Salary',
                                amount: 3200.00,
                                category: 'salary'
                            },
                            {
                                id: 'tx003',
                                date: '2024-03-13',
                                description: 'Netflix Subscription',
                                amount: -15.99,
                                category: 'entertainment'
                            }
                        ]
                    },
                    {
                        id: 'ch002',
                        type: 'savings',
                        name: 'Chase Savings Account',
                        balance: 10000.00,
                        transactions: [
                            {
                                id: 'tx004',
                                date: '2024-03-10',
                                description: 'Interest Payment',
                                amount: 5.50,
                                category: 'investments'
                            }
                        ]
                    }
                ]
            },
            'BBVA': {
                validCredentials: { username: 'demo_bbva', password: 'bbva123' },
                accounts: [
                    {
                        id: 'bb001',
                        type: 'checking',
                        name: 'BBVA Free Checking',
                        balance: 5000.00,
                        transactions: [
                            {
                                id: 'tx005',
                                date: '2024-03-14',
                                description: 'Salary Deposit',
                                amount: 3000.00,
                                category: 'salary'
                            },
                            {
                                id: 'tx006',
                                date: '2024-03-12',
                                description: 'Restaurant Payment',
                                amount: -45.80,
                                category: 'food'
                            }
                        ]
                    },
                    {
                        id: 'bb002',
                        type: 'credit',
                        name: 'BBVA Credit Card',
                        balance: -350.25,
                        transactions: [
                            {
                                id: 'tx007',
                                date: '2024-03-11',
                                description: 'Amazon Purchase',
                                amount: -120.99,
                                category: 'shopping'
                            }
                        ]
                    }
                ]
            }
        };
    }

    async connectToBank(bankName, credentials) {
        // Simular delay de conexión
        await new Promise(resolve => setTimeout(resolve, 1500));

        const bankData = this.mockBankData[bankName];
        if (!bankData) {
            throw new Error('Bank not supported');
        }

        if (this.validateCredentials(bankData.validCredentials, credentials)) {
            return {
                success: true,
                bankId: bankName.toLowerCase() + '_' + Date.now(),
                accounts: bankData.accounts
            };
        } else {
            throw new Error('Invalid credentials');
        }
    }

    validateCredentials(valid, provided) {
        return valid.username === provided.username && 
               valid.password === provided.password;
    }

    async getTransactions(bankId, accountId, fromDate) {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retornar transacciones simuladas
        const bank = Object.values(this.mockBankData).find(b => 
            b.accounts.some(a => a.id === accountId)
        );

        if (!bank) {
            throw new Error('Account not found');
        }

        const account = bank.accounts.find(a => a.id === accountId);
        return account.transactions;
    }
}

export default new BankApiService(); 