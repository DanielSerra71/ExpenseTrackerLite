const express = require('express');
const PouchDB = require('pouchdb');
const app = express();
const port = process.env.PORT || 3000;

// Configuración básica de Express
app.use(express.json());
app.use(express.static('public'));

// Configuración de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Configuración de PouchDB
app.use('/db', require('express-pouchdb')(PouchDB));

// Rutas básicas
app.get('/', (req, res) => {
    res.send('Servidor de Control de Gastos funcionando');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 