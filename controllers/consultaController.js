const mongoose = require('mongoose');

const Consulta = mongoose.model('Consulta');
const Paciente = mongoose.model('Paciente');

exports.getConsultas = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = (page * limit) - limit;

  const consultasPromise = await Consulta
    .find()
    .populate('paciente')
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const countPromise = Consulta.count();
  const [consultas, count] = await Promise.all([consultasPromise, countPromise]);
  const pages = Math.ceil(count / limit);

  if (!consultas.length && skip) {
    req.flash('info', `Hey! you asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
    res.redirect(`/consultas/page/${pages}`);
    return;
  }

  res.render('consultas', { title: 'Consultas', consultas, pages, page, count });
};

exports.addConsulta = async (req, res) => {
  const paciente = await Paciente.findOne({ _id: req.params.id });
  res.render('editConsulta', { title: 'Agregar Consulta', paciente });
};

exports.createConsulta = async (req, res) => {
  req.body.paciente = req.params.id;
  const paciente = await Paciente.findOne({ _id: req.params.id });
  const newConsulta = new Consulta(req.body);
  await newConsulta.save();
  req.flash('success', 'Consulta creada correctamente!');
  res.redirect(`/paciente/${paciente.slug}`);
};
