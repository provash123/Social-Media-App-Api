const router = require("express").Router();
const Users = require("../models/Users");
const bcrypt = require("bcrypt");

// Updated user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await Users.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(500).json("you can change your id");
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await Users.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been Deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(500).json("you can delete your own id");
  }
});

// get user

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await Users.findById( userId )
      : await Users.findOne({ username: username });
    const { password, updatedAt, isAdmin, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get friends

router.get("/friends/:userId", async(req,res)=>{
   try{
     const user = await Users.findById(req.params.userId)
     const friends = await Promise.all(
       user.followings.map((friendId)=>{
         return Users.findById(friendId)
       })
     )
     let friendList = []
     friends.map((friend)=>{
       const { _id, username, profilePicture } = friend
       friendList.push({ _id, username, profilePicture })
     })
     res.status(200).json(friendList)
   }
  
   catch(err){
     res.status(500).json(err)
   }
})

//follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await Users.findById(req.params.id);
      const currentUser = await Users.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user hasbeen followed");
      } else {
        res.status(200).json("user already followed this user");
      }
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(500).json("you cant follow yourself");
  }
});
//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await Users.findById(req.params.id);
      const currentUser = await Users.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user hasbeen unfollowed");
      } else {
        res.status(200).json("user dont follow this user");
      }
    } catch (err) {
      res.status(403).json(err);
    }
  } else {
    res.status(500).json("you cant unfollow yourself");
  }
});

module.exports = router;
