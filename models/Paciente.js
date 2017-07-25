const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const slug = require('slugs');

const pacienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    required: 'Ingresar un nombre!',
  },
  slug: String,
  direccion: String,
  telefono: String,
  created: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

pacienteSchema.index({
  nombre: 'text',
});

pacienteSchema.pre('save', async function (next) {
  if (!this.isModified('nombre')) {
    next();
    return;
  }
  this.slug = slug(this.nombre);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const pacientesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (pacientesWithSlug.length) {
    this.slug = `${this.slug}-${pacientesWithSlug.length + 1}`;
  }
  next();
});

pacienteSchema.virtual('consultas', {
  ref: 'Consulta',
  localField: '_id',
  foreignField: 'paciente',
});

function autopopulate (next) {
  this.populate('consultas');
  next();
}

pacienteSchema.pre('find', autopopulate);
pacienteSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Paciente', pacienteSchema)
