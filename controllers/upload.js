const multer = require('multer');
const db = require('../data/db');
const reader = require('../data/reader');
const upload = multer({dest: 'uploads/'});

module.exports = (app) => {
  // Upload
  app.get('/upload', (req, res) => {
    res.render('upload.handlebars');
  });
  app.post('/upload/text', upload.single('doc'), (req, res) => {
    if (req.file) {
      const doc = reader.text(req.file.path);
      let time = 0;
      const id = req.file.path.split('/')[1];
      console.log(id);
      for (let i = 1; i < doc.length; i++) {
        db.upsert(doc[i], `${id}-${i}`)
            .then(function(value) {
              time += value;
              console.log(time);
            },
            function(error) {
              console.log(error);
            });
      };
      db.sqlUpload(doc, id);
    }
    res.redirect('/docs/search');
  });
};
