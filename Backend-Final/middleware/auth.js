const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const JuegoModel = require('../models/Juego');
const ResenaModel = require('../models/Resena');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// simple in-memory cache of connections by dbName
const connections = {};

function buildUserUri(baseUri, dbName) {
  // Replace the database portion of the connection string with the user's dbName
  // Matches protocol://host.../maybeDb?query
  return baseUri.replace(/(mongodb(?:\+srv)?:\/\/[^\/]+)\/?([^?]*)/, `$1/${dbName}`);
}

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, dbName: payload.dbName };

    const dbName = payload.dbName;
    if (!dbName) return res.status(400).json({ error: 'No dbName in token' });

    if (!connections[dbName]) {
      const base = process.env.MONGODB_URL;
      if (!base) return res.status(500).json({ error: 'Server DB not configured' });
      const userUri = buildUserUri(base, dbName);
      const conn = mongoose.createConnection(userUri, { useNewUrlParser: true, useUnifiedTopology: true });
      // create models bound to this connection
      connections[dbName] = { conn, models: {
        Juego: JuegoModel.getModel(conn),
        Resena: ResenaModel.getModel(conn)
      }};
    }

    req.db = connections[dbName].conn;
    req.models = connections[dbName].models;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token or auth error', details: err.message });
  }
};
