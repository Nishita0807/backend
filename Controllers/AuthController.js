const express = require("express");
const { validateRegisterData } = require("../Utils/AuthUtil");
const User = require("../Models/UserModel");
const AuthRouter = express.Router();
const bcrypt = require("bcrypt");
const { isAuth } = require("../Middlewares/AuthMiddleware");

AuthRouter.post("/register", async (req, res) => {
  const { name, email, username, password } = req.body;

  //clean the data
  try {
    await validateRegisterData({ email, username, name, password });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Data error",
      error: error,
    });
  }

  //check if email and username already exist

  try {
    await User.userNameAndEmailExist({ email, username });
    const obj = new User({ email, name, username, password });
    const userDb = await obj.registerUser();
    return res.send({
      status: 201,
      message: "Register successfull",
      data: userDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

AuthRouter.post("/login", async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password)
    return res.send({
      status: 400,
      message: "Missing credentials",
    });

  //find the user from db
  try {
    const userDb = await User.findUserWithLoginId({ loginId });

    //compare the password
    const isMatched = await bcrypt.compare(password, userDb.password);
    if (!isMatched) {
      return res.send({
        status: 400,
        message: "Password doest not matched",
      });
    }

    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id, //BSON  userDb._id.toString()
      email: userDb.email,
      username: userDb.username,
    };

    return res.send({
      status: 200,
      message: "Login successfull",
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

AuthRouter.post("/logout", isAuth, async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send({ status: 400, message: "Logout unsuccessfull" });
    return res.send({ status: 200, message: "Logout successfull" });
  });
});
module.exports = AuthRouter;