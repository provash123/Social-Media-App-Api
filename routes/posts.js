const router = require("express").Router();
const Posts = require("../models/Posts");
const Users = require("../models/Users");

//create a post
router.post("/", async (req, res) => {
  const newPost = await new Posts(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});


//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("your post updated");
    } else {
    }
  } catch (err) {
    res.status(500).json("you can updated your own status");
  }
});

//delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("your post deleted");
    } else {
    }
  } catch (err) {
    res.status(500).json("you can delete your own post");
  }
});

//like/dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("the post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("the post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await Users.findById(req.params.userId);
    console.log("current user ", currentUser);
    const userPosts = await Posts.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Posts.find({ userId: friendId });
      })
    );

    res.json(userPosts.concat(...friendPosts));
  } catch (err) {
    console.log("error", err);
    res.status(500).json(err);
  }
});

//get timeline all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });
    const post = await Posts.find({ userId: user._id });
    res.status(200).json(post);
  } catch (err) {
    console.log("error", err);
    res.status(500).json(err);
  }
});

module.exports = router;
