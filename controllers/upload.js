const multer = require('multer');
const db = require('../data/db');
const reader = require('../data/reader');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'tmp/uploads');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    if (file.mimetype === 'application/pdf') {
      cb(null, file.fieldname + '_' + uniqueSuffix + '.pdf');
    } else {
      cb(null, file.fieldname + '_' + uniqueSuffix);
    }
  },
});

const upload = multer({storage: storage});
module.exports = (app) => {
  // Upload

  app.get('/upload', (req, res) => {
    res.render('upload.handlebars');
  });

  app.post('/upload/text', upload.single('doc'), (req, res) => {
    if (req.file) {
      const doc = reader.text(req.file.path);
      let time = 0;
      const len = req.file.path.split('/').length;
      const id = req.file.path.split('/')[len-1];
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

  app.post('/upload/pdf', upload.single('doc'), (req, res) => {
    if (req.file) {
      // eslint-disable-next-line no-unused-vars
      const file = reader.pdfReader(req.file.path)
          .then((doc) => {
            let time = 0;
            const len = req.file.path.split('/').length;
            const id = req.file.path.split('/')[len-1];
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
          });
    }
    res.redirect('/docs/search');
  });
};
