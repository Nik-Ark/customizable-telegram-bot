const express = require("express");

const port = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

module.exports = app;
