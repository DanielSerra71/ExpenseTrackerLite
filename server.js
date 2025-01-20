require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración correcta de Plaid usando la nueva API
const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

const client = new PlaidApi(configuration);
const accessTokens = new Map();

app.post('/get_link_token', async (req, res) => {
    try {
        const request = {
            user: { client_user_id: 'user-id' },
            client_name: 'Expense Tracker Lite',
            products: ['transactions'],
            country_codes: ['US'],
            language: 'en'
        };

        const response = await client.linkTokenCreate(request);
        console.log('Link token created successfully');
        res.json({ link_token: response.data.link_token });
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/exchange_public_token', async (req, res) => {
    try {
        console.log('Received exchange request for user:', req.body.user_id);
        const request = {
            public_token: req.body.public_token
        };
        const response = await client.itemPublicTokenExchange(request);
        const accessToken = response.data.access_token;

        console.log('Got access token:', accessToken.slice(-4));
        accessTokens.set(req.body.user_id, accessToken);

        // Log para ver todos los tokens almacenados
        console.log('Current stored tokens:',
            Array.from(accessTokens.entries())
                .map(([id, token]) => `${id}: ${token.slice(-4)}`));

        res.json({ success: true });
    } catch (error) {
        console.error('Error exchanging token:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/transactions', async (req, res) => {
    try {
        const userId = req.query.user_id;
        console.log('\nTransaction request for user:', userId);

        const accessToken = accessTokens.get(userId);
        console.log('Found access token:', accessToken ? 'Yes' : 'No');

        if (!accessToken) {
            console.log('Available tokens:',
                Array.from(accessTokens.entries())
                    .map(([id, token]) => `${id}: ${token.slice(-4)}`));
            return res.status(400).json({
                error: 'No access token found',
                transactions: []
            });
        }

        const endDate = new Date().toISOString().slice(0, 10);
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        console.log('Requesting transactions:', {
            startDate,
            endDate,
            accessToken: accessToken.slice(-4)
        });

        const request = {
            access_token: accessToken,
            start_date: startDate,
            end_date: endDate,
            options: {
                count: 100,
                offset: 0,
                include_personal_finance_category: true
            }
        };

        const response = await client.transactionsGet(request);
        console.log('Plaid response received:', {
            success: true,
            total_transactions: response.data.total_transactions,
            transactions_count: response.data.transactions.length
        });

        const formattedTransactions = response.data.transactions.map(transaction => ({
            date: transaction.date,
            name: transaction.merchant_name || transaction.name,
            amount: transaction.amount,
            category: transaction.personal_finance_category?.detailed || 'Uncategorized',
            pending: transaction.pending,
            account_id: transaction.account_id
        }));

        res.json({
            success: true,
            total: response.data.total_transactions,
            transactions: formattedTransactions
        });
    } catch (error) {
        console.error('Detailed error in /transactions:', error.response?.data || error);
        res.status(500).json({
            error: error.message,
            transactions: []
        });
    }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 