const express = require('express');
const app = express();
const bodyParser = require('body-parser');

require("./src/usuarios");

app.use(bodyParser.json());

module.exports = app;
