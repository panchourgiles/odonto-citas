const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
const pacienteController = require('../controllers/pacienteController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const consultaController = require('../controllers/consultaController');

/* PACIENTE */
/* Listado */
router.get('/', catchErrors(pacienteController.getPacientes));
router.get('/pacientes', catchErrors(pacienteController.getPacientes));
router.get('/pacientes/page/:page', catchErrors(pacienteController.getPacientes));

/* Agregar */
router.get('/add' ,
  authController.isLoggedIn,
  pacienteController.addPaciente
);
router.post('/add',
  authController.isLoggedIn,
  catchErrors(pacienteController.createPaciente)
);
/* Modificar */
router.get('/pacientes/:id/edit', pacienteController.editPaciente);
router.post('/add/:id',
  catchErrors(pacienteController.updatePaciente)
);
/* Ver */
router.get('/paciente/:slug', catchErrors(pacienteController.getPacienteBySlug));

/* API - Buscar  */
router.get('/api/search', catchErrors(pacienteController.searchPacientes));

/* CONSULTA */
/* Listado */
router.get('/consultas', catchErrors(consultaController.getConsultas));
router.get('/consultas/:id/add', authController.isLoggedIn, catchErrors(consultaController.addConsulta));
router.post('/consultas/:id/add', authController.isLoggedIn, catchErrors(consultaController.createConsulta));

/* Agregar*/
router.get('/consultas/add' ,
  authController.isLoggedIn,
  consultaController.addConsulta
);

/* USER */
router.get('/logout', authController.logout);
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);
router.post('/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);
router.get('/account', userController.account);
router.post('/account', catchErrors(userController.updateAccount));


module.exports = router;
