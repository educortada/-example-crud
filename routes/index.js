const express = require('express');
const router = express.Router();

const Tortilla = require('../models/Tortilla');

const { requireUser } = require('../middlewares/auth');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    const tortillas = await Tortilla.find();
    res.render('tortilla/list', { tortillas });
  } catch (error) {
    next(error);
  }
});

router.get('/new', requireUser, (req, res, next) => {
  res.render('tortilla/create-edit');
});

router.post('/', requireUser, async (req, res, next) => {
  // _id of tortilla
  const { _id, name, special, size } = req.body;
  const tortilla = { name, special, size };
  try {
    if (_id) {
      await Tortilla.findByIdAndUpdate(_id, tortilla);
    } else {
      // _id of currentUser
      tortilla.creator = req.session.currentUser._id;
      await Tortilla.create(tortilla);
    }
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

router.get('/tortillas/:id', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  try {
    // populate() retorna toda la informacioón del objeto referencia
    const tortilla = await Tortilla.findById(id).populate('creator');

    let isCreator = false;
    if (tortilla.creator.equals(_id)) {
      isCreator = true;
    }
    res.render('tortilla/detail', { tortilla, isCreator });
  } catch (error) {
    next(error);
  }
});

router.get('/tortillas/:id/edit', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;

  try {
    const tortilla = await Tortilla.findById(id);
    if (!tortilla.creator.equals(_id)) {
      return res.redirect('/');
    }

    res.render('tortilla/create-edit', tortilla);
  } catch (error) {
    next(error);
  }
});

router.post('/tortillas/:id/delete', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  try {
    const tortilla = await Tortilla.findById(id);
    if (tortilla.creator.equals(_id)) {
      await Tortilla.findByIdAndDelete(id);
    }
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
