const UserSchema = require("../Schemas/UserSchema");
const bcrypt = require("bcrypt");
const ObjectId = require("mongodb").ObjectId;

const User = class {
  username;
  name;
  email;
  password;

  constructor({ email, username, password, name }) {
    this.email = email;
    this.username = username;
    this.password = password;
    this.name = name;
  }

  registerUser() {
    return new Promise(async (resolve, reject) => {
      const hashedPassword = await bcrypt.hash(
        this.password,
        parseInt(process.env.SALT)
      );

      const userObj = new UserSchema({
        name: this.name,
        email: this.email,
        password: hashedPassword,
        username: this.username,
      });
      try {
        const userDb = await userObj.save();
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  static userNameAndEmailExist({ email, username }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userExist = await UserSchema.findOne({
          $or: [{ email }, { username }],
        });

        if (userExist && userExist.email === email)
          reject("Email already exist.");
        if (userExist && userExist.username === username)
          reject("Username already exist.");

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  static findUserWithLoginId({ loginId }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userDb = await UserSchema.findOne({
          $or: [{ email: loginId }, { username: loginId }],
        }).select("+password");
        if (!userDb) reject("User does not exist, please register first");

        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  static verifyUserId({ userId }) {
    return new Promise(async (resolve, reject) => {
      if (!ObjectId.isValid(userId)) reject("Invalid userId");

      try {
        const userDb = await UserSchema.findOne({ _id: userId });
        if (!userDb) reject(`No user found with userId : ${userId}`);

        resolve(userDb);
      } catch (error) {
        reject(error);
      }

      resolve();
    });
  }
};

module.exports = User;

//controller (Obj) <----model(User) userObj <-----Schema