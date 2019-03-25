'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upload = upload;

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @route POST /upload
// @desc  Uploads file to DB
function upload(req, res) {
  req.app.io.emit('fileupdate', req.file.filename);
  // wss.clients.forEach(client => {
  //   if (client.readyState === WebSocket.OPEN) {
  //     client.send(req.file.filename);
  //   }
  // });
  res.json({ file: req.file });
}