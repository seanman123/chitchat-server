const Comment = require('../../models/Comment');

module.exports = (app) => {
  app.get('/api/getComments', async (req, res) => {
    try {
      const comments = await Comment.aggregate([
        { $match: { original_post_id: req.query.original_id } },
        { $sort: { date: -1 } },
        { $limit: 500 }
      ]);

      const postCommentsArray = comments.sort((a,b) => {
        const aLikeDiff = a.liked_by.length - a.disliked_by.length;
        const bLikeDiff = b.liked_by.length - b.disliked_by.length;
        return aLikeDiff - bLikeDiff;
      }).reverse();

      res.json(postCommentsArray);
      
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.put('/api/updateComment', async (req, res) => {
    try {
      await Comment.findByIdAndUpdate(req.body.id, { body: req.body.body });
      return res.json({ status: 'ok' });
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.post('/api/likeComment', async (req, res) => {
    const currentComment = await Comment.findById(req.body.id);
    const currentDislikesArray = currentComment.disliked_by;
    const hasDisliked = currentDislikesArray.includes(req.body.user_id);

    if (currentComment.liked_by.includes(req.body.user_id)) {
      Comment.findByIdAndUpdate(req.body.id,
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
      Comment.findByIdAndUpdate(req.body.id,
        { $pull: { disliked_by: req.body.user_id } },
        function (err, result) {
          if (err) {
            res.json({ error: 'error' })
          }
        }
      );
    }

    Comment.findByIdAndUpdate(req.body.id,
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

  app.post('/api/dislikeComment', async (req, res) => {
    const currentComment = await Comment.findById(req.body.id);
    const currentLikesArray = currentComment.liked_by;
    const hasLiked = currentLikesArray.includes(req.body.user_id);

    if (currentComment.disliked_by.includes(req.body.user_id)) {
      Comment.findByIdAndUpdate(req.body.id,
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
      Comment.findByIdAndUpdate(req.body.id,
        { $pull: { liked_by: req.body.user_id } },
        function (err, result) {
          if (err) {
            res.json({ error: 'error' })
          }
        }
      );
    }
    Comment.findByIdAndUpdate(req.body.id,
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

  app.delete('/api/deleteComment', async (req, res) => {
    try {
      await Comment.remove({ _id: req.body.id });
      return res.json({ status: 'ok' });
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.post('/api/createComment', async (req, res) => {
    try {
      await Comment.create({
        body: req.body.body,
        author_id: req.body.author_id,
        author_username: req.body.author_username,
        original_post_id: req.body.original_post_id,
        date: Date.now(),
        liked_by: [],
        disliked_by: []
      });
      return res.json({ status: 'ok' });
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });

  app.get('/api/getComment', async (req, res) => {
    try {
      const post = await Comment.findOne({ _id: req.query.id });
      return res.json(post);
    } catch (err) {
      res.json({ status: 'error', error: err });
    }
  });
}