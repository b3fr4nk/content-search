module.exports = (app) => {
  // index
  app.get('/', (req, res) => {
    res.render('index.handlebars');
  });
};
