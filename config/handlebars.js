const exphbs = require("express-handlebars");
const path = require("path");

const configureHandlebars = (app) => {
  const hbs = exphbs.create({
    extname: ".hbs",
    defaultLayout: false,
    partialsDir: path.join(__dirname, "../views/partials"),
    helpers: {
      range: function (n) {
        return Array.from({ length: n }, (_, i) => i);
      },
      add: function (a, b) {
        return parseInt(a) + parseInt(b);
      },
      sub: function (a, b) {
        return parseInt(a) - parseInt(b);
      },
      randomAlive: function () {
        const isAlive = Math.random() < 0.3;
        return isAlive;
      },
    },
  });

  app.engine("hbs", hbs.engine);
  app.set("view engine", "hbs");
  app.set("views", "./views");
};

module.exports = configureHandlebars;
