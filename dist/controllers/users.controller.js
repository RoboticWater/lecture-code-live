'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var express = require('express');
var router = express.Router();

/* GET users listing. */
function getUsers(req, res, next) {
  return res.json([{ id: 1, name: 'bloop' }, { id: 2, name: 'flop' }]);
}

exports.default = { getUsers: getUsers };