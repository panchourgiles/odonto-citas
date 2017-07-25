const mongoose = require('mongoose');

const Paciente = mongoose.model('Paciente');

exports.getPacientes = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = (page * limit) - limit;

  const pacientesPromise = Paciente
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const countPromise = Paciente.count();
  const [pacientes, count] = await Promise.all([pacientesPromise, countPromise]);
  const pages = Math.ceil(count / limit);

  if (!pacientes.length && skip) {
    req.flash('info', `Hey! you asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`);
    res.redirect(`/pacientes/page/${pages}`);
    return;
  }

  res.render('pacientes', { title: 'Pacientes', pacientes, pages, page, count });
};

exports.addPaciente = (req, res) => {
  res.render('editPaciente', { title: 'Agregar Paciente' });
};

exports.createPaciente = async (req, res) => {
  const paciente = await (new Paciente(req.body).save());
  req.flash('success', `El paciente ${paciente.nombre} se ha creado exitosamente`);
  res.redirect(`/paciente/${paciente.slug}`);
};

exports.editPaciente = async (req, res) => {
  const paciente = await Paciente.findOne({ _id: req.params.id });
  res.render('editPaciente', { title: `Edit ${paciente.nombre}`, paciente });
};

exports.updatePaciente = async (req, res) => {
  const paciente = await Paciente.findOneAndUpdate({ _id: req.params.id }, req.body,
    {
      new: true,
      runValidators: true,
    }).exec();
  req.flash('success', `El paciente <strong>${paciente.nombre}</strong> se actualizo correctamente. <a href="pacientes/${paciente.slug}">Ver paciente</a>`);
  res.redirect(`/pacientes/${paciente._id}/edit`);
};

exports.getPacienteBySlug = async (req, res) => {
  const paciente = await Paciente.findOne({ slug: req.params.slug });
  res.render('paciente', { title: paciente.nombre, paciente });
};

exports.searchPacientes = async (req, res) => {
  const pacientes = await Paciente
  .find(
    {
      $text: { $search: req.query.q },
    },
    {
      score: { $meta: 'textScore' },
    },
  )
  .sort({
    score: { $meta: 'textScore' },
  })
  .limit(5);
  res.json(pacientes);
};
