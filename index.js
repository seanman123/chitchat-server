require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const { Schema } = mongoose;
const auth = require("./middleware/auth");

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors());

const mongoSecret = process.env.MONGO_URI;

mongoose.connect(mongoSecret, { useNewUrlParser: true, useUnifiedTopology: true });

require('./routes')(app);

app.get("/userAuth", auth, (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});