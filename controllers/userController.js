const mongoose = require('mongoose');

const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Registrar' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('nombre');
  req.checkBody('nombre', 'Debes ingresar un nombre').notEmpty();
  req.checkBody('email', 'La dirección de correo no es válida').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', 'La contraseña no puede ser vacía!').notEmpty();
  req.checkBody('password-confirm', 'Confirmar contraseña no puede ser vacía!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Las contraseñas deben ser iguales').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Registrar', body: req.body, flashes: req.flash() });
    return;
  }
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, nombre: req.body.nombre });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // pass to authController.login
};

exports.account = (req, res, next) => {
  res.render('account', { title: 'Mi cuenta' });
};

exports.updateAccount = async (req, res, next) => {
  const update = {
    nombre: req.body.nombre,
    email: req.body.email,
  };
  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: update },
    {
      new: true,
      runValidators: true,
      context: 'query',
    },
  );

  req.flash('success', 'Tu perfil se actualizo correctamente');
  res.redirect('back');
};
