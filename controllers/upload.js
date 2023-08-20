/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const multer = require('multer');
const db = require('../data/db');
const reader = require('../data/reader');
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

const pineconeUpload = (doc, path, namespace, video=false) => {
  let time = 0;

  const len = path.split('/').length;
  let id = path.split('/')[len-1];
  for (let i = 1; i < doc.length; i++) {
    let data = doc[i];
    // get time stamp for url
    if (video) {
      const mins = Math.floor(data[1]/60000);
      const secs = Math.floor(data[1]/1000) - mins*60;
      const timestamp = `&t=${mins}m${secs}s`;
      id = timestamp;
      data = data[0];

      db.upsert(data, `${id}`, namespace, path)
          .then(function(value) {
            time += value;
            console.log(time);
          },
          function(error) {
            console.log(error);
          });
    } else {
      db.upsert(data, `${id}-${i}`, namespace, path)
          .then(function(value) {
            time += value;
            console.log(time);
          },
          function(error) {
            console.log(error);
          });
    }
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
      const len = req.file.path.split('/').length;
      const id = req.file.path.split('/')[len-1];


      const doc = reader.text(req.file.path);
      pineconeUpload(doc, id, req.body.namespace);
    }
    res.redirect('/docs/search');
  });

  app.post('/upload/pdf', upload.single('doc'), (req, res) => {
    if (req.file) {
      const len = req.file.path.split('/').length;
      const id = req.file.path.split('/')[len-1];

      // eslint-disable-next-line no-unused-vars
      const file = reader.pdfReader(req.file.path)
          .then((doc) => {
            pineconeUpload(doc, id, req.body.namespace);
          });
    }
    res.redirect('/docs/search');
  });

  app.post('/upload/word', upload.single('doc'), (req, res) => {
    if (req.file) {
      const len = req.file.path.split('/').length;
      const id = req.file.path.split('/')[len-1];

      const file = reader.wordReader(req.file.path)
          .then((doc) => {
            pineconeUpload(doc, id, req.body.namespace);
          });
    }
    res.redirect('/docs/search');
  });

  app.post('/upload/ppt', upload.single('doc'), (req, res) => {
    if (req.file) {
      const len = req.file.path.split('/').length;
      const id = req.file.path.split('/')[0];

      const file = reader.pptReader(req.file.path)
          .then((doc) => {
            pineconeUpload(doc, id, req.body.namespace);
          });
      res.redirect('/docs/search');
    }
  });

  app.post('/upload/excel', upload.single('doc'), (req, res) => {
    if (req.file) {
      const len = req.file.path.split('/').length;
      const id = req.file.path.split('/')[len-1];

      const file = reader.excelReader(req.file.path)
          .then((doc) => {
            pineconeUpload(doc, id, req.body.namespace);
          });
      res.redirect('/docs/search');
    }
  });

  app.post('/upload/youtube', upload.single('doc'), (req, res) => {
    if (req.body.url) {
      const id = req.body.url.split('=')[1].split('&')[0];
      const captions = reader.youtubeReader(id).then((result) => {
        pineconeUpload(result, `${req.body.url}`, req.body.namespace, video=true);
      });
    }
    res.redirect('/docs/search');
  });
};
