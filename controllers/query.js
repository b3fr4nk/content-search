/* eslint-disable max-len */
const db = require('../data/db');
const reader = require('../data/reader');

module.exports = (app) => {
  app.get('/docs/document/:id', (req, res) => {
    if (req.params.id) {
      const text = reader(`./uploads/${req.params.id}`);

      res.render('doc.handlebars', {text});
    }
    return res.status(404);
  });

  // Search
  app.get('/docs/search', (req, res) => {
    res.render('search.handlebars');
  });

  app.post('/docs/search', (req, res) => {
    const start = Date.now();
    db.query(req.body.search)
        .then(
            function(value) {
              const results = [];
              for (let i = 0; i < value.matches.length; i++) {
                // TODO make the link to the doc work
                const text = value.matches[i].metadata.text;
                const file = value.matches[i].metadata.filepath.split('/')[1].split('-')[0];
                results.push({text: text, path: `/docs/document/${file}`, index: i+1});
              }
              const end = Date.now();
              console.log(`Query time: ${end - start}ms`);
              res.render('search.handlebars', {results});
            },
            function(error) {
              console.log(error);
            },
        );
  });
};
