const User = require('../../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (app) => {
  app.post('/api/register', async (req, res) => {
    try {
      const user = await User.create({
        username: req.body.username,
        password: req.body.password
      });
      if (user) {
        const token = jwt.sign(
          {
            username: user.username,
            id: user._id
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );

        user.token = token;

        res.json({ status: 'ok', user: token });
      } else {
        res.json({ status: 'error', user: false });
      }
    } catch (err) {
      res.json({ status: 'error', error: 'Duplicate username' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
      username: req.body.username,
      password: req.body.password
    });

    if (user) {
      const token = jwt.sign(
        {
          username: user.username,
          id: user._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      user.token = token;
      
      res.json({ status: 'ok', user: token });
    } else {
      res.json({ status: 'error', user: false });
    }
  });
}