import { Like } from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/api.response.js"
import { asyncHandler } from "../utils/async.handler.js";
import {Video} from "../models/video.model.js"
import { user } from "../models/user.model.js";
import { Tweets } from "../models/tweets.model.js";
import { Comment } from "../models/commet.model.js";


const ToggleVideoLike = asyncHandler(async(req , res) => {
    const {VideoId} = req.params

    if (!VideoId) {
        throw new ApiError(400 , "Video id is required!")
    }

    const UserId = req.user._id

    const User = await user.findById(UserId)
    if(!User) {
        throw new ApiError(404 , "User not found")
        
    }

    const video = await Video.findOne({ _id: VideoId});
    if (!video) {
        throw new ApiError(404 , "Video not Found!")
    }

 try {
     const ExistingLike = await Like.findOne({
       video: VideoId,
       likedby: UserId
     }
     )
     if (!ExistingLike) {
        // If the like doesn't exist, add it (like the video)
        await Like.create({
          video: VideoId,
          likedby: UserId,
        });
      } else {
        // If the like exists, remove it (unlike the video)
        await Like.findByIdAndDelete({
          _id: ExistingLike._id,
        });
        return res.status(200).json(
            new ApiResponse(200 , {
                video: VideoId,
                owner:  UserId,
                message: "Video UNLIKED Sucessfully"
            }))
      }
 } catch (error) {
    console.log("error while unliking the Video" , error)
 }

 return res.status(200).json(
    new ApiResponse(200 , {
        video: VideoId,
        owner:  UserId,
        message: "Video LIKED Sucessfully"
    }))
});


const ToggleTweetlikes = asyncHandler(async(req , res) => {
    // take tweet id from req.params
    // find the user in datbase
    // create a like on tweet using like.createOne
    // returing the response
    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(404 , "Tweet id is required!")
    }

    const UserId = req.user._id

    const User = await user.findById(UserId)
    if (!User) {
        throw new ApiError(400 , "User not found!")
    }

    const findtweet = await Tweets.findById(tweetId)
    if (!findtweet) {
        throw new ApiError(404 , "Tweet not found!")
    }

    const ExistingLike = await Like.findOne({
        tweet: tweetId,
        likedby: UserId
      }
      )
      if (!ExistingLike) {
         // If the like doesn't exist, add it (like the video)
         await Like.create({
           tweet: tweetId,
           likedby: UserId,
         });
       } else {
         // If the like exists, remove it (unlike the video)
         await Like.findByIdAndDelete({
           _id: ExistingLike._id,
         });
         return res.status(200).json(
            new ApiResponse(200 , {
                tweet: tweetId,
                owner:  UserId,
                message: "Tweet Like Removed Sucessfully!"
            }))
        }

  return res.status(201).json({
    status: 201,
    tweet: tweetId,
    owner: UserId,
    message: "Tweet Liked successfully!",
  });
   
})

const ToggleCommentsLikes = asyncHandler(async(req , res) => {
  // take comment Id from req.params = 
  // find user in database and verify it 
  // find the comment in database which is user liking on 
  // check if the user has already liked the comment or not if not create a like on that commnet
  // return response to user
  const {commentId} = req.params
  if (!commentId) {
    throw new ApiError(404 , "Comment id is required!")
  }
  const UserId = req.user._id

  const foundUser = await user.findById(UserId)

  if (!foundUser) {
    throw new ApiError(400 , "user does not exist in database")
  }

  const FindComment = await Comment.findById(commentId)
  if (!FindComment) {
    throw new ApiError(404 , "comment that user is trying to like does not exist")
  }

  const ExistingLike = await Like.findOne(
    {
      comments: commentId,
      likedby: UserId
    }
  )
  if (!ExistingLike) {
    await Like.create({
      comments: commentId,
      likedby: UserId
    })

  } else {
    await Like.findByIdAndDelete(
      {
       _id: ExistingLike._id
      }
    )
    return res.status(200).json(
      new ApiResponse(200 , {
          Comments: commentId,
          owner:  UserId,
          message: "Comment Like Removed Sucessfully!"
      }))
  }
  return res.status(200).json(
    new ApiResponse(200 , {
        Comments: commentId,
        owner:  UserId,
        message: "Comment Liked Sucessfully!"
    }))
  
})

const GetLikeVideos = asyncHandler(async(req , res) => {
  // take userfrom req.params
  // match likes model and videos model and take id from it by using lookup
  // and use add fields to count the all the liked videos
  // and project the final result
  // return response to the user

  const UserId = req.user._id
  if (!UserId) {
    throw new ApiError(404 , "user not found")
  }
  const LikedVideos = await Like.aggregate([

    {
      $match: {
        video: {
          $exists: true,
        }
      }
    },

    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "LikedVideos"
      }
    }, // // Count the videos
    {
      $addFields: {
        TotalLikeVideos: {
          $size: "$LikedVideos"
        }
      }
    },
    {
      $project: {
        LikedVideos: 1,
        TotalLikeVideos: 1,
       
      }
    }
  ])

  return res.status(200).json(
    new ApiResponse(200 , {
        owner:  UserId,
        LikedVideos,
        message: "LIKED vidoes Fetched sucessfully"
    }))
  
})


export {
ToggleVideoLike,
ToggleTweetlikes,
ToggleCommentsLikes,
GetLikeVideos

}