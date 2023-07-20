/* eslint-disable max-len */
const db = require('../data/db');

module.exports = (app) => {
  app.get('/docs/document/:id', (req, res) => {
    if (req.params.id && typeof req.params.id === 'string') {
      const file = req.params.id;
      // eslint-disable-next-line no-unused-vars
      const query = db.sqlQuery(`SELECT doc FROM docs WHERE p_id = '${file}'`)
          .then(function(result) {
            return res.render('doc.handlebars', {text: result.rows[0].doc.replace(/\{\s*\"|\s*\"\}/g, '')});
          },
          function(error) {
            console.log(error);
          });
    } else {
      return res.status(404);
    }
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
                const file = value.matches[i].metadata.filepath.split('-')[0];
                results.push({text: text, path: `${file}`, index: i+1});
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

  app.get('docs/full/:id', (req, res) => {

  });
};
