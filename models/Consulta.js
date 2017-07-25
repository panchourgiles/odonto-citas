const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const consultaSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  paciente: {
    type: mongoose.Schema.ObjectId,
    ref: 'Paciente',
    required: 'Debes ingresar un paciente!',
  },
  piezas: [String],
  descripcion: {
    type: String,
    required: 'Debes ingresar un texto!',
  },
});

module.exports = mongoose.model('Consulta', consultaSchema);
