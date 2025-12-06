require('dotenv').config(); 

const express = require('express'); 
const mongoose = require('mongoose'); 
const app = express(); 
const cors = require('cors'); 
const PORT = process.env.PORT || 3000; 
const MONGODB_URL = process.env.MONGODB_URL; 

app.use(express.json()); 
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
})); 


// CONEXIÓN CON LA BD
mongoose.connect(MONGODB_URL) 
    .then(() => {
        console.log('Conexión exitosa a MongoDB Atlas'); 
    })
    .catch(err => {
        console.log('Error de conexión', err.message); 
        process.exit(1); 
    })

// RUTAS
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const juegoRoutes = require('./routes/juegoRoutes');
const resenasRoutes = require('./routes/resenaRoutes');

app.use('/api/auth', authRoutes);

// simple healthcheck
app.get('/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Protect API routes so each request uses the user's DB
app.use('/api/juegos', authMiddleware, juegoRoutes);
app.use('/api/resenas', authMiddleware, resenasRoutes);

app.listen(PORT, () => {
    console.log(`Servidor Corriendo en http://localhost:${PORT}`) 
})