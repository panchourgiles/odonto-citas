const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'Has iniciado sesión!',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Has cerrado la sesión!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'Lo sentimos! Debes iniciar sesión para realizar esta operación');
  res.redirect('login');
};

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No existe una cuenta con esa dirección de correo');
    return res.redirect('/login');
  }

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();

  req.flash('success', 'Se ha enviado un link a tu dirección de correo.');
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash('error', 'El link es inválido o a expirado');
    res.redirect('/login');
  }
  res.render('reset');
};

exports.confirmedPasword = async (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next();
    return;
  }
  req.flash('error', 'Las contraseñas no coinciden');
  res.redirect('back');
};

exports.update = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash('error', 'El link es inválido o a expirado');
    res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updateUser = await user.save();
  await req.login(updateUser);
  req.flash('success', 'Tu contraseña ha sido cambiada');
  res.redirect('/');
};
