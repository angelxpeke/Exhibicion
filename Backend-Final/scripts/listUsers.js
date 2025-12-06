require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URL = process.env.MONGODB_URL;

async function listUsers() {
  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Conexión exitosa\n');

    const users = await User.find({});

    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados en la BD.');
      return;
    }

    console.log(`📊 Total de usuarios: ${users.length}\n`);
    console.log('─'.repeat(100));
    console.log(`${'Username'.padEnd(20)} ${'Email'.padEnd(40)} ${'DB Name'.padEnd(30)} ${'Creado'.padEnd(10)}`);
    console.log('─'.repeat(100));

    users.forEach((user) => {
      const createdAt = new Date(user.createdAt).toLocaleDateString('es-ES');
      console.log(
        `${user.username.padEnd(20)} ${(user.email || 'N/A').padEnd(40)} ${user.dbName.padEnd(30)} ${createdAt.padEnd(10)}`
      );
    });

    console.log('─'.repeat(100));
    console.log(`\n📋 Detalles completos (JSON):`);
    console.log(JSON.stringify(users, null, 2));

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

listUsers();
