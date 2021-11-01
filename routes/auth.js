const router = require("express").Router();
const Users = require("../models/Users");
const bcrypt = require("bcrypt");

//Register
router.post("/register", async (req, res) => {
  try {
    // generate new password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(req.body.password, salt);
    //generate new register
    const newUser = new Users({
      username: req.body.username,
      email: req.body.email,
      password: hashpassword,
      desc:req.body.desc
    });
    //save user and response
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});
//Login
router.post("/login", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(404).json("wrong password");
    res.json(user)
  } catch (err) {
    res.status(500).json(err)
  }
});



module.exports = router;
