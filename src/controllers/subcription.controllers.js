import {user} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/api.response.js"
 import { asyncHandler } from "../utils/async.handler.js"
import {Subscription} from "../models/subscription.model.js"
import mongoose from "mongoose"
// checks if the user has sub to the channel or not if not subs to the channel

const ToggleSubcription = asyncHandler(async(req , res) => {
// get the channel id from the url
// find the user in the database
// find the channel in subcription collection (check if the user has sub to the channel or not)
// returing the response 
   const {channelId} = req.params

   if (!channelId) {
     throw new ApiError(404 , "channel id is required!")
   }
    const UserId = req.user._id

    const User = await user.findById(UserId)
    if (!User) {
        throw new ApiError(400 , "User does not exist in database")
    }

    const Subscriptionsssss = await Subscription.findOne(
      {
        subcriber: UserId,
        channel: channelId
      }
    )
    if (Subscriptionsssss) {
      await Subscription.findByIdAndDelete(
        {
          subcriber: UserId,
          channel: channelId,
        }
      )
    } else {
      await Subscription.create(
        {
          subcriber: UserId,
          channel : channelId
        }
      )
    }
    return res.status(200).json(
      new ApiResponse(200, {
        subcriber: UserId ,  // Corrected 'subcriber' to 'subscriber' and using 'userId' variable
        channel: channelId,
        message: "Channel Subscribed Successfully"  // Corrected spelling of 'Subbed' to 'Subscribed'
      })
    )

})

// // controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

  // Ensure the channel ID is an ObjectId
  const channelId = new mongoose.Types.ObjectId(req.params.channelId);

  // Check if the channel exists (optional)
  const channelExists = await user.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  // Aggregation pipeline
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId, // Match documents where channel matches the given ID
      },
    },

    {
      $lookup: {
        from: "users", // The collection to join (User collection)
        localField: "subscriber", // Field in Subscription to match
        foreignField: "_id", // Field in User to match
        as: "subscriberDetails", // Output field for matched User documents
      },
    },
    {
      $count: "subscribersCount", // Count the number of matching documents
    },
  ]);
 
  if (!subscribers || subscribers.length === 0) {
    throw new ApiError(404, "No subscribers found for the given channel");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      channel: channelId,
      subscribers,
    })
  );
});



const getSubscribedChannels = asyncHandler(async(req , res) => {
  const {subcriberId} = req.params;
  if (!subcriberId) {
    throw new ApiError(404 , "Id is required!");
  }

  const subscriptions = await Subscription.aggregate([

    {
      $match: {
        subcriber:  new mongoose.Types.ObjectId(subcriberId) // Match subscription documents where the subscriber is the provided user
      }
    },
    {
      $lookup: {
        from: "users", // Look up user details (channels the user subscribed to)
        localField: "channel",
        foreignField: "_id",
        as: "ChannelDetails"
      }
    },
    
    {
      $project: {
        subcriber: 1,
        subscriptions: 1
      }
    },
    {
      $count: 
        "Channel Subbed To"
      
    } ,
  ]);

  if (!subscriptions || subscriptions.length === 0) {
    throw new ApiError(404, "User has not subscribed to any channels.");
  }

  return res.status(200).json(
    new ApiResponse(200, {
       subscriptions, // Return the count of subscriptions
    })
  );
});


export {
  ToggleSubcription,
  getUserChannelSubscribers,
 getSubscribedChannels
}