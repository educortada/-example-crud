const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const User = require('../models/User');

const { requireAnon, requireUser, requireFields } = require('../middlewares/auth');

const saltRounds = 10;

router.get('/signup', requireAnon, (req, res, next) => {
  // Si ya esta logeado redirigir a la misma página
  // if (req.session.currentUser) {
  //   res.redirect('/');
  //   return;
  // }
  const data = {
    messages: req.flash('validation')
  };
  res.render('auth/signup', data);
});

router.post('/signup', requireAnon, requireFields, async (req, res, next) => {
  // Extraer body
  const { username, password } = req.body;
  // // Comprobar que username y password existen
  // if (!password || !username) {
  //   res.redirect('/auth/signup');
  //   return;
  // }
  // Comprobar que el usuario no existe en DB
  try {
    const result = await User.findOne({ username });
    if (result) {
      req.flash('validation', 'This username is taken');
      res.redirect('/auth/signup');
      return;
    }
    // Encriptar el password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    // Crear el usuario
    const newUser = {
      username,
      password: hashedPassword
    };

    const createUser = await User.create(newUser);
    // Guardamos el usuario en la sesión
    req.session.currentUser = createUser;
    // Redirigimos a la home
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

router.get('/login', requireAnon, (req, res, next) => {
  // Si ya esta logeado redirigir a la misma página
  // if (req.session.currentUser) {
  //   res.redirect('/');
  //   return;
  // }
  const data = {
    messages: req.flash('validation')
  };
  res.render('auth/login', data);
});

router.post('/login', requireAnon, requireFields, async (req, res, next) => {
  // Proteger
  // if (req.session.currentUser) {
  //   res.redirect('/');
  //   return;
  // }
  // Extraer la info del body
  const { username, password } = req.body;
  // Comprobar que se ha introducido usuario y pw
  // if (!password || !username) {
  //   res.redirect('/auth/login');
  //   return; // Terminar la ejecución
  // }
  try {
    // Obtener el usuario de la DB
    const user = await User.findOne({ username });

    if (!user) {
      req.flash('validation', 'Username or password incorrect');
      res.redirect('/auth/login');
      return; // Terminar la ejecución
    }
    // Comparar el password del formulario (password) con el password del 'user'
    if (bcrypt.compareSync(password, user.password)) {
      // Save the login in the session!
      req.session.currentUser = user;
      res.redirect('/');
    } else {
      req.flash('validation', 'Username or password incorrect');
      res.redirect('/auth/login');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireUser, (req, res, next) => {
  // Proteger si ya estas logeado no hacer logout

  // if (!req.session.currentUser) {
  //   res.redirect('/');
  //   return;
  // }
  delete req.session.currentUser;
  res.redirect('/');
});

module.exports = router;
