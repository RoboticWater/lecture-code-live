'use strict';

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json([{ id: 1, name: 'bloop' }, { id: 2, name: 'blop' }]);
});

module.exports = router;