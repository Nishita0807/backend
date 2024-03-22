const express = require("express");
const User = require("../Models/UserModel");
const { BlogDataValidate } = require("../Utils/BlogUtil");
const {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogWithId,
  updateBlog,
  deleteBlog,
} = require("../Models/BlogModel");
const BlogSchema = require("../Schemas/BlogSchema");
const rateLimiting = require("../Middlewares/RateLimiting");
const { followingUserList } = require("../Models/FollowModel");

const BlogRouter = express.Router();

BlogRouter.post("/create-blog", rateLimiting, async (req, res) => {
  const { title, textBody } = req.body;
  const userId = req.session.user.userId;
  const creationDateTime = Date.now();

  try {
    await BlogDataValidate({ title, textBody });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Blog data error",
      error: error,
    });
  }
  try {
    await User.verifyUserId({ userId });
  } catch (error) {
    return res.send({
      status: 400,
      error: error,
    });
  }

  //create blog in Db
  try {
    const blogDb = await createBlog({
      title,
      textBody,
      userId,
      creationDateTime,
    });
    return res.send({
      status: 201,
      message: "Blog created successfully",
      data: blogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

// /get-blogs?skip=5
BlogRouter.get("/get-blogs", async (req, res) => {
  const SKIP = parseInt(req.query.skip) || 0;

  try {
    const followingUserData = await followingUserList({
      SKIP: 0,
      followerUserId: req.session.user.userId,
    });

    const followingUserIds = followingUserData.map((user) => {
      return user._id;
    });

    const blogDb = await getAllBlogs({ followingUserIds, SKIP });
    if (blogDb.length === 0) {
      return res.send({
        status: 400,
        message: "No more Blogs",
      });
    }
    return res.send({
      status: 200,
      message: "Read success",
      data: blogDb,
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

// /my-blogs?skip=5
BlogRouter.get("/my-blogs", async (req, res) => {
  const SKIP = parseInt(req.query.skip) || 0;
  const userId = req.session.user.userId;

  try {
    const myBlogsDb = await getMyBlogs({ SKIP, userId });
    if (myBlogsDb.length === 0) {
      return res.send({
        status: 400,
        message: "No more Blogs",
      });
    }
    return res.send({
      status: 200,
      message: "Read success",
      data: myBlogsDb,
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

BlogRouter.post("/edit-blog", rateLimiting, async (req, res) => {
  const { title, textBody } = req.body.data;
  const blogId = req.body.blogId;
  const userId = req.session.user.userId;

  try {
    //data validation
    await BlogDataValidate({ title, textBody });

    //verifyUSerID
    await User.verifyUserId({ userId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Data error",
      error: error,
    });
  }

  try {
    //find the blog with blogId
    const blogDb = await getBlogWithId({ blogId });
    console.log(blogDb);

    //compare the ownership

    // if(userId.toString() !== blogDb.userId.toString())
    // id1.equals(id2)
    if (!userId.equals(blogDb.userId)) {
      return res.send({
        status: 403,
        message: "Not allowed to edit this blog, Authorization failed",
      });
    }

    // check if > 30
    const diff = (Date.now() - blogDb.creationDateTime) / (1000 * 60);

    if (diff > 30) {
      return res.send({
        status: 400,
        message: "Not allow to edit after 30 mins of creation",
      });
    }

    //edit the blog
    const prevBlog = await updateBlog({ title, textBody, blogId });

    return res.send({
      status: 200,
      message: "Blog updated successfully",
      data: prevBlog,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

BlogRouter.post("/delete-blog", rateLimiting, async (req, res) => {
  const blogId = req.body.blogId;
  const userId = req.session.user.userId;

  if (!blogId)
    return res.send({
      status: 400,
      message: "Missing blog id",
    });

  try {
    await User.verifyUserId({ userId });
  } catch (error) {
    return res.send({
      status: 500,
      error: error,
    });
  }

  //find the blog from db with blogId
  //check ownership
  //delete the blog
  try {
    const blogDb = await getBlogWithId({ blogId });

    if (!blogDb.userId.equals(userId)) {
      return res.send({
        status: 403,
        message: "Not allow to delete, authorization failed.",
      });
    }

    const prevBlogDb = await deleteBlog({ blogId });

    return res.send({
      status: 200,
      message: "Delete successfull",
      data: prevBlogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

module.exports = BlogRouter;