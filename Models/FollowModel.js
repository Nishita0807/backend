const FollowSchema = require("../Schemas/FollowSchema");
const UserSchema = require("../Schemas/UserSchema");
const { LIMIT } = require("../privateConstants");

const followUser = ({ followerUserId, followingUserId }) => {
  return new Promise(async (resolve, reject) => {
    //check if A following B
    try {
      const followExist = await FollowSchema.findOne({
        followerUserId,
        followingUserId,
      });
      if (followExist) return reject("Already following the user");

      const followObj = new FollowSchema({
        followerUserId,
        followingUserId,
        creationDateTime: Date.now(),
      });

      const followDb = await followObj.save();
      resolve(followDb);
    } catch (error) {
      reject(error);
    }
  });
};

const followingUserList = ({ followerUserId, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      //match, sort, pagination
      const followingList = await FollowSchema.aggregate([
        {
          $match: { followerUserId: followerUserId },
        },
        {
          $sort: { creationDateTime: -1 },
        },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);
      // console.log(followingList[0].data);

      //populate the data
      // const followingUserData = await FollowSchema.find({
      //   followerUserId,
      // }).populate("followingUserId").sort().skip(SKIP).limit(LIMIT);
      // console.log(followingList[0].data);

      let followingUserIdList = [];

      followingList[0].data.map((item) => {
        followingUserIdList.push(item.followingUserId);
      });
      console.log(followingUserIdList);

      const followingUserDetails = await UserSchema.aggregate([
        {
          $match: { _id: { $in: followingUserIdList } },
        },
      ]);
      console.log(followingUserDetails);
      resolve(followingUserDetails.reverse());
    } catch (error) {
      reject(error);
    }
  });
};

const followerUserList = ({ followingUserId, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followersList = await FollowSchema.aggregate([
        {
          $match: { followingUserId: followingUserId },
        },
        {
          $sort: { creationDateTime: -1 },
        },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);

      const followerUserIds = followersList[0].data.map(
        (obj) => obj.followerUserId
      );

      const userDetails = await UserSchema.aggregate([
        {
          $match: { _id: { $in: followerUserIds } },
        },
      ]);

      resolve(userDetails.reverse());
    } catch (error) {
      reject(error);
    }
  });
};

const unFollowUser = ({ followingUserId, followerUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followDb = await FollowSchema.findOneAndDelete({
        followerUserId,
        followingUserId,
      });
      resolve(followDb);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  followUser,
  followingUserList,
  followerUserList,
  unFollowUser,
};