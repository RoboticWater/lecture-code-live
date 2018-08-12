'use strict';

var express = require('express');
var router = express.Router();

var users = require('../controllers/users.controller');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/users', users.getUsers);

module.exports = router;