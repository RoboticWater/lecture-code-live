import WebSocket from 'ws'
// @route POST /upload
// @desc  Uploads file to DB
export function upload(req, res, wss) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(req.file.filename);
    }
  });
  res.json({ file: req.file });
}