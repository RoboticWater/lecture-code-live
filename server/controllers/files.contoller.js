// @route GET /files
// @desc  Display all files in JSON
export function getFiles(req, res, db) {
  db.gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0)
      return res.status(404).json({ err: 'No files exist' });

    return res.json(files);
  });
}

// @route GET /files/:filename
// @desc  Display single file object
export function getFile(req, res, db) {
  db.gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0)
      return res.status(404).json({ err: 'No file exists' });

    return res.json(file);
  });
}

// @route DELETE /files/:filename
// @desc  Delete file
export function deleteFile(req, res, db) {
  db.gfs.remove({ filename: req.params.filename, root: 'uploads' }, (err, gridStore) => {
    if (err)
      return res.status(404).json({ err: err });
    req.app.io.emit('fileupdate', req.params.filename);
    return res.json("deleted");
  });
}

// @route DELETE /files/:filename
// @desc  Delete file
export function deleteFileByPath(req, res, db) {
  db.gfs.files.findOne({ 'metadata.path': req.body.filepath }, (err, file) => {
    if (!file || file.length === 0)
      return res.status(404).json({ err: 'No file exists' });
    db.gfs.remove({ filename: file.filename, root: 'uploads' }, (err, gridStore) => {
      if (err) {
        console.log(err)
        return res.status(404).json({ err: err });
      }
      req.app.io.emit('fileupdate', file.filename);
      return res.json("deleted")
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
export function getContent(req, res, db) {
  db.gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0)
      return res.status(404).json({ err: 'No file exists' });

    const readstream = db.gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
}