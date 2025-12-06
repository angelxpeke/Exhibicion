const mongoose = require('mongoose'); 


const JuegoSchema = new mongoose.Schema({

  nombre: { 
    type: String, 
    required: [true, 'El nombre del juego es obligatorio'], 
    trim: true, 
    unique: true 
  },

  plataforma: {
    type: String, 
    required: [true, 'La plataforma es obligatoria'] 
  },

  portadaURL: { 
    type: String, 
    required: false 
  },

  estado: {
    type: String, 
    enum: ['Pendiente', 'Jugando', 'Completado'], 
    default: 'Pendiente' 
  },

  horasJugadas: { 
    type: Number, 
    default: 0, 
    min: 0 
  }

}, {
  timestamps: true 
});

// Export schema and helper to create a model bound to a connection
module.exports = {
  schema: JuegoSchema,
  getModel: (conn) => conn.model('Juego', JuegoSchema)
};