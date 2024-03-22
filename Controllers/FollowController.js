const express = require("express");
const User = require("../Models/UserModel");
const {
  followUser,
  followingUserList,
  followerUserList,
  unFollowUser,
} = require("../Models/FollowModel");
const FollowRouter = express.Router();

FollowRouter.post("/follow-user", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const followingUserId = req.body.followingUserId;

  if (followerUserId.toString() === followingUserId.toString()) {
    return res.send({
      status: 400,
      message: "Can not process the request",
    });
  }

  try {
    await User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Follower User id not found",
    });
  }

  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Following User id not found",
    });
  }

  try {
    const followDb = await followUser({ followerUserId, followingUserId });
    console.log(followDb);
    return res.send({
      status: 200,
      message: "Follow successfull",
      data: followDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

// /following-list?skip=5
FollowRouter.get("/following-list", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const SKIP = Number(req.query.skip) || 0;
  console.log(followerUserId);
  try {
    await User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      error: error,
    });
  }

  //call the function
  try {
    const followDb = await followingUserList({ followerUserId, SKIP });

    return res.send({
      status: 200,
      message: "Read success",
      data: followDb,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

FollowRouter.get("/follower-list", async (req, res) => {
  const followingUserId = req.session.user.userId;
  const SKIP = Number(req.query.skip) || 0;

  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      error: error,
    });
  }

  try {
    const followerUserData = await followerUserList({ followingUserId, SKIP });
    return res.send({
      status: 200,
      message: "Read success",
      data: followerUserData,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

FollowRouter.post("/unfollow-user", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const followingUserId = req.body.followingUserId;

  try {
    await User.verifyUserId({ userId: followerUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Follower user id not found",
    });
  }

  try {
    await User.verifyUserId({ userId: followingUserId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Following user id not found",
    });
  }

  try {
    const followDb = await unFollowUser({ followerUserId, followingUserId });

    return res.send({
      status: 200,
      message: "Unfollow successfull",
      data: followDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

module.exports = FollowRouter;

//test1--->test2
//test1--->test3
//test1--->test4
//test2--->test1
//test3--->test1
//test5--->test1