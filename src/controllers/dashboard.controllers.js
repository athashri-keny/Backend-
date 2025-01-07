import mongoose from "mongoose"
import { asyncHandler } from "../utils/async.handler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/api.response.js"
import { Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import { Like } from "../models/like.model.js";

const GetChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(404, "User not found");
  }

  // Aggregation for total subscribers
  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null, // selects the whole document 
        subscribersCount: {
           $sum: 1 // adds 
          },
      },
    },
  ]);

  // Aggregation for video details
  const videoDetails = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes", 
      },
    },
    {
      $project: {
        totalLikes: { $size: "$likes" }, // Size of likes array
        totalViews: "$views",
      },
    },
    {
      $group: {
        _id: null, // selects the whole docment
        totalLikes: { $sum: "$totalLikes" },
        totalViews: { $sum: "$totalViews" },
        totalVideos: { $sum: 1 },
      },
    },
   
  ]);

  // Constructing the stats object
  const channelStats = {
    totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
    totalLikes: videoDetails[0]?.totalLikes || 0, 
    totalViews: videoDetails[0]?.totalViews || 0,
    totalVideos: videoDetails[0]?.totalVideos || 0,
  };

  // Returning the response
  return res.status(200).json(
    new ApiResponse(200, channelStats, "Channel stats fetched successfully")
  );
});


const GetChannelTotalVideo = asyncHandler(async(req , res) => {
// userid from req.user._id
// finding in the video model using grouping 
// and add them 

  const UserId = req.user._id
  if (!UserId) {
    throw new ApiError(404 , "User id not provided")
  }

  const ChannelVideos = await  Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(UserId)
      }
    },
    {
      $group: {
        _id: null,
        TotalVideos: {
          $sum: 1
        }
      }
    }
  ])

  const stats = {
    channelvid: ChannelVideos[0]?.TotalVideos || 0 
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, stats, "Channel Videos fetched successfully")
    );
})





export { GetChannelStats,
  GetChannelTotalVideo

 };
