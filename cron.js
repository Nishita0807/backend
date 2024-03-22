const cron = require("node-cron");
const BlogSchema = require("./Schemas/BlogSchema");

function cleanUpBin() {
  cron.schedule("* * 0 * * *", async () => {
    console.log("cron is working");

    const deletedBlogs = await BlogSchema.find({ isDelete: true });
    if (deletedBlogs.length > 0) {
      const deletedBlogsId = [];
      deletedBlogs.map((blog) => {
        const diff =
          (Date.now() - blog.deletionDateTime.getTime()) /
          (1000 * 60 * 60 * 24);
        if (diff > 30) {
          // 30 days
          deletedBlogsId.push(blog._id);
        }
      });

      if (deletedBlogsId.length > 0) {
        try {
          const deleteBlogDb = await BlogSchema.findOneAndDelete({
            _id: { $in: deletedBlogsId },
          });
          console.log(`Blog has been deleted BlogId: ${deleteBlogDb._id}`);
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("No deleted blogs found");
      }
    }
  });
}

module.exports = cleanUpBin;