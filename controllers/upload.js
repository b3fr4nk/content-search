/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const multer = require('multer');
const db = require('../data/db');
const reader = require('../data/reader');
const {default: axios} = require('axios');
const wordExt = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const pptExt = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const xlsxExt = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/docs');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);

    // console.log(file.mimetype);

    if (file.mimetype === 'application/pdf') {
      cb(null, file.fieldname + '_' + uniqueSuffix + '.pdf');
    } else if (file.mimetype === wordExt) {
      cb(null, file.fieldname + '_' + uniqueSuffix + '.docx');
    } else if (file.mimetype === pptExt) {
      cb(null, file.fieldname + '_' + uniqueSuffix + '.pptx');
    } else if (file.mimetype === xlsxExt) {
      cb(null, file.fieldname + '_' + uniqueSuffix + '.xlsx');
    } else {
      cb(null, file.fieldname + '_' + uniqueSuffix + '.txt');
    }
  },
});

const pineconeUpload = (doc, path, namespace) => {
  let time = 0;
  const len = path.split('/').length;
  const id = path.split('/')[len-1];
  for (let i = 1; i < doc.length; i++) {
    db.upsert(doc[i], `${id}-${i}`, namespace)
        .then(function(value) {
          time += value;
          console.log(time);
        },
        function(error) {
          console.log(error);
        });
  };
  db.sqlUpload(path, id);
};

const upload = multer({storage: storage});
module.exports = (app) => {
  // Upload

  app.get('/upload', (req, res) => {
    res.render('upload.handlebars');
  });

  app.post('/upload/text', upload.single('doc'), (req, res) => {
    if (req.file) {
      const doc = reader.text(req.file.path);
      pineconeUpload(doc, req.file.path, req.body.namespace);
    }
    res.redirect('/docs/search');
  });

  app.post('/upload/pdf', upload.single('doc'), (req, res) => {
    if (req.file) {
      // eslint-disable-next-line no-unused-vars
      const file = reader.pdfReader(req.file.path)
          .then((doc) => {
            pineconeUpload(doc, req.file.path, req.body.namespace);
          });
    }
    res.redirect('/docs/search');
  });

  app.post('/upload/word', upload.single('doc'), (req, res) => {
    if (req.file) {
      const file = reader.wordReader(req.file.path)
          .then((doc) => {
            pineconeUpload(doc, req.file.path, req.body.namespace);
          });
    }
    res.redirect('/docs/search');
  });

  app.post('/upload/ppt', upload.single('doc'), (req, res) => {
    if (req.file) {
      const file = reader.pptReader(req.file.path)
          .then((doc) => {
            pineconeUpload(doc, req.file.path, req.body.namespace);
          });
      res.redirect('/docs/search');
    }
  });

  app.post('/upload/excel', upload.single('doc'), (req, res) => {
    if (req.file) {
      const file = reader.excelReader(req.file.path)
          .then((doc) => {
            console.log('doc: ' + doc);
            pineconeUpload(doc, req.file.path, req.body.namespace);
          });
      res.redirect('/docs/search');
    }
  });

  app.post('/upload/youtube', upload.single('doc'), (req, res) => {
    if (req.body.url) {
      const id = req.body.url.split('=')[1].split('&')[0];
      const captions = reader.youtubeReader(id).then((result) => {
        console.log(result.length);
        pineconeUpload(result, req.body.url, req.body.namespace);
      });
    }
  });
};
