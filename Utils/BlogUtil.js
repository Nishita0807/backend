const BlogDataValidate = ({ title, textBody }) => {
    return new Promise((resolve, reject) => {
      if (!title || !textBody) reject("Missing blog data.");
  
      if (typeof title !== "string") return reject("Title is not a text");
      if (typeof textBody !== "string") return reject("Body is not a text");
  
      resolve();
    });
  };
  module.exports = { BlogDataValidate };