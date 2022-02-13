const Post = require('../../models/Post');

module.exports = (app) => {
  app.post('/api/createPost', async (req, res) => {
    try {
      await Post.create({
        body: req.body.body,
        author_id: req.body.id,
        author_username: req.body.username,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        date: Date.now(),
        liked_by: [],
        disliked_by: []
      });
      return res.json({ status: 'ok' });
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.get('/api/getPost', async (req, res) => {
    try {
      const post = await Post.findOne({ _id: req.query.id });
      return res.json(post);
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.get('/api/getUserPosts', async (req, res) => {
    try {
      const posts = await Post.find({ author_id: req.query.id });
      return res.json(posts);
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.get('/api/getPosts', async (req, res) => {
    const posts = await Post.aggregate([
      { $sort: { date: -1 } },
      { $limit: 500 }
    ]);

    if (posts) {
      const postSortedArray = posts.sort((a,b) => {
        const aLikeDiff = a.liked_by.length - a.disliked_by.length;
        const bLikeDiff = b.liked_by.length - b.disliked_by.length;
        return aLikeDiff - bLikeDiff;
      }).reverse();
      res.json(postSortedArray);
    } else {
      res.json({ error: 'error' });
    }
  });

  app.delete('/api/deletePost', async (req, res) => {
    try {
      await Post.remove({ _id: req.body.id });
      return res.json({ status: 'ok' });
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.put('/api/updatePost', async (req, res) => {
    try {
      await Post.findByIdAndUpdate(req.body.id, { body: req.body.body });
      return res.json({ status: 'ok' });
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.post('/api/likePost', async (req, res) => {
    const currentPosts = await Post.findById(req.body.id);
    const currentDislikesArray = currentPosts.disliked_by;
    const hasDisliked = currentDislikesArray.includes(req.body.user_id);

    if (currentPosts.liked_by.includes(req.body.user_id)) {
      Post.findByIdAndUpdate(req.body.id,
        { $pull: { liked_by: req.body.user_id } },
        function (err, result) {
          if (err) {
            res.json({ error: 'error' });
          }
        }
      );
      res.json({ status: 'ok' });
      return;
    }

    if (hasDisliked) {
      Post.findByIdAndUpdate(req.body.id,
        { $pull: { disliked_by: req.body.user_id } },
        function (err, result) {
          if (err) {
            res.json({ error: 'error' })
          }
        }
      );
    }

    Post.findByIdAndUpdate(req.body.id,
      { $push: { liked_by: req.body.user_id } },
      function (err, result) {
        if (err) {
          res.json({ error: 'error' });
        } else {
          res.json({ status: 'ok' });
        }
      }
    );
  });

  app.post('/api/dislikePost', async (req, res) => {
    const currentPosts = await Post.findById(req.body.id);
    const currentLikesArray = currentPosts.liked_by;
    const hasLiked = currentLikesArray.includes(req.body.user_id);

    if (currentPosts.disliked_by.includes(req.body.user_id)) {
      Post.findByIdAndUpdate(req.body.id,
        { $pull: { disliked_by: req.body.user_id } },
        function (err, result) {
          if (err) {
            res.json({ error: 'error' });
          }
        }
      );
      res.json({ status: 'ok' });
      return;
    }

    if (hasLiked) {
      Post.findByIdAndUpdate(req.body.id,
        { $pull: { liked_by: req.body.user_id } },
        function (err, result) {
          if (err) {
            res.json({ error: 'error' })
          }
        }
      );
    }
    Post.findByIdAndUpdate(req.body.id,
      { $push: { disliked_by: req.body.user_id } },
      function (err, result) {
        if (err) {
          res.json({ error: 'error' });
        } else {
          res.json({ status: 'ok' });
        }
      }
    );
  });
}