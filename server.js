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

app.get('/transactions', (req, res) => {
    const userId = req.query.user_id;
    // Asegúrate de que userId esté definido y sea válido
    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    // Lógica para obtener transacciones del usuario
    const transactions = getTransactionsForUser(userId); // Implementa esta función según tu lógica
    res.json(transactions);
});

app.post('/exchange_public_token', async (req, res) => {
    const publicToken = req.body.public_token;
    try {
        const response = await client.exchangePublicToken(publicToken);
        const accessToken = response.access_token;
        const itemId = response.item_id;
        // Guarda el accessToken y itemId en tu base de datos o en memoria
        res.json({ accessToken, itemId });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).send({ error: 'Failed to exchange public token' });
    }
});

function getTransactionsForUser(userId) {
    // Aquí deberías implementar la lógica para obtener las transacciones del usuario
    // Esto podría ser una consulta a una base de datos o una llamada a un servicio externo
    // Por ahora, devolveremos un ejemplo de transacciones
    return [
        { date: '2023-10-01', name: 'Compra en tienda', amount: 50.00 },
        { date: '2023-10-02', name: 'Pago de servicios', amount: 100.00 }
    ];
}

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 