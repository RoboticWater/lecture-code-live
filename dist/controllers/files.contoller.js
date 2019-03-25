'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFiles = getFiles;
exports.getFile = getFile;
exports.deleteFile = deleteFile;
exports.deleteFileByPath = deleteFileByPath;
exports.getContent = getContent;
// @route GET /files
// @desc  Display all files in JSON
function getFiles(req, res, db) {
  db.gfs.files.find().toArray(function (err, files) {
    if (!files || files.length === 0) return res.status(404).json({ err: 'No files exist' });

    return res.json(files);
  });
}

// @route GET /files/:filename
// @desc  Display single file object
function getFile(req, res, db) {
  db.gfs.files.findOne({ filename: req.params.filename }, function (err, file) {
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file exists' });

    return res.json(file);
  });
}

// @route DELETE /files/:filename
// @desc  Delete file
function deleteFile(req, res, db) {
  db.gfs.remove({ filename: req.params.filename, root: 'uploads' }, function (err, gridStore) {
    if (err) return res.status(404).json({ err: err });
    req.app.io.emit('fileupdate', req.params.filename);
    return res.json("deleted");
  });
}

// @route DELETE /files/:filename
// @desc  Delete file
function deleteFileByPath(req, res, db) {
  db.gfs.files.findOne({ 'metadata.path': req.body.filepath }, function (err, file) {
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file exists' });
    db.gfs.remove({ filename: file.filename, root: 'uploads' }, function (err, gridStore) {
      if (err) {
        console.log(err);
        return res.status(404).json({ err: err });
      }
      req.app.io.emit('fileupdate', file.filename);
      return res.json("deleted");
    });
  });
  // db.gfs.remove({ filename: file.filename, root: 'uploads' }, (err, gridStore) => {
  //     if (err) {
  //       console.log(err)
  //       return res.status(404).json({ err: err });
  //     }

  //     return res.json("deleted");
  //   });
  // db.gfs.remove({ 'filepath': req.body.filepath, root: 'uploads' }, (err, gridStore) => {
  //   if (err) {
  //     console.log(err)
  //     return res.status(404).json({ err: err });
  //   }

  //   return res.json("deleted");
  // });
}

// @route GET /:filename
// @desc  Get file contents by filename
function getContent(req, res, db) {
  db.gfs.files.findOne({ filename: req.params.filename }, function (err, file) {
    if (!file || file.length === 0) return res.status(404).json({ err: 'No file exists' });

    var readstream = db.gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
}