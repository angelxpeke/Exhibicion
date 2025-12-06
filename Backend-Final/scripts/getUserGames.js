#!/usr/bin/env node
/**
 * Script para listar juegos de un usuario específico
 * Uso: node scripts/getUserGames.js <username>
 * Ejemplo: node scripts/getUserGames.js elsocio
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const JuegoModel = require('../models/Juego');
const ResenaModel = require('../models/Resena');

const MONGODB_URL = process.env.MONGODB_URL;

async function getUserGames(username) {
  try {
    console.log(`\n🔍 Buscando usuario: ${username}\n`);
    
    // Conectar a BD principal
    await mongoose.connect(MONGODB_URL);
    
    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      console.error(`❌ Usuario "${username}" no encontrado`);
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   BD Personal: ${user.dbName}`);
    console.log(`   Creado: ${new Date(user.createdAt).toLocaleString('es-ES')}\n`);

    // Crear conexión a la BD del usuario
    function buildUserUri(baseUri, dbName) {
      return baseUri.replace(/(mongodb(?:\+srv)?:\/\/[^\/]+)\/?([^?]*)/, `$1/${dbName}`);
    }

    const userUri = buildUserUri(MONGODB_URL, user.dbName);
    const userConn = mongoose.createConnection(userUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });

    // Crear modelos para la BD del usuario
    const Juego = JuegoModel.getModel(userConn);
    const Resena = ResenaModel.getModel(userConn);

    // Obtener juegos
    const juegos = await Juego.find({});
    console.log(`📊 Juegos registrados: ${juegos.length}\n`);

    if (juegos.length > 0) {
      console.log('─'.repeat(120));
      console.log(`${'Nombre'.padEnd(30)} ${'Plataforma'.padEnd(20)} ${'Estado'.padEnd(15)} ${'Horas'.padEnd(10)} ${'Creado'.padEnd(15)}`);
      console.log('─'.repeat(120));

      juegos.forEach((juego) => {
        const createdAt = new Date(juego.createdAt).toLocaleDateString('es-ES');
        console.log(
          `${(juego.nombre || 'N/A').substring(0, 29).padEnd(30)} ${(juego.plataforma || 'N/A').padEnd(20)} ${(juego.estado || 'N/A').padEnd(15)} ${String(juego.horasJugadas || 0).padEnd(10)} ${createdAt.padEnd(15)}`
        );
      });
      console.log('─'.repeat(120));
    }

    // Obtener reseñas
    const resenas = await Resena.find({}).populate('juego', 'nombre');
    console.log(`\n⭐ Reseñas escritas: ${resenas.length}\n`);

    if (resenas.length > 0) {
      console.log('─'.repeat(140));
      console.log(`${'Juego'.padEnd(30)} ${'Puntuación'.padEnd(15)} ${'Autor'.padEnd(20)} ${'Texto'.padEnd(65)} ${'Creada'.padEnd(10)}`);
      console.log('─'.repeat(140));

      resenas.forEach((resena) => {
        const juegoNombre = resena.juego?.nombre || 'Desconocido';
        const createdAt = new Date(resena.createdAt).toLocaleDateString('es-ES');
        const textoPreview = (resena.texto || 'N/A').substring(0, 64);
        console.log(
          `${juegoNombre.substring(0, 29).padEnd(30)} ${'⭐'.repeat(resena.puntuacion).padEnd(15)} ${(resena.autor || 'N/A').padEnd(20)} ${textoPreview.padEnd(65)} ${createdAt.padEnd(10)}`
        );
      });
      console.log('─'.repeat(140));
    }

    console.log('\n✅ Proceso completado\n');
    userConn.close();

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

const username = process.argv[2];
if (!username) {
  console.error('❌ Por favor proporciona un username como argumento');
  console.error('   Uso: node scripts/getUserGames.js <username>');
  process.exit(1);
}

getUserGames(username);
