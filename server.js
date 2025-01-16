require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const plaid = require('plaid');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const client = new plaid.Client({
    clientID: process.env.PLAID_CLIENT_ID,
    secret: process.env.PLAID_SECRET,
    env: plaid.environments[process.env.PLAID_ENV],
});

// Endpoint para obtener el token de enlace
app.post('/get_link_token', async (req, res) => {
    try {
        const response = await client.createLinkToken({
            user: {
                client_user_id: 'unique_user_id',
            },
            client_name: 'Expense Tracker Lite',
            products: ['auth', 'transactions'],
            country_codes: ['US'],
            language: 'en',
        });
        res.json(response);
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).send({ error: 'Failed to create link token' });
    }
});

app.get('/transactions', async (req, res) => {
    const accessToken = req.query.access_token; // Asegúrate de obtener el accessToken de manera segura
    try {
        const response = await client.getTransactions(accessToken, '2023-01-01', '2023-12-31', {
            count: 250,
            offset: 0,
        });
        res.json(response.transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send({ error: 'Failed to fetch transactions' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 