import { asyncHandler } from "../utils/async.handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/api.response.js";
import { Tweets } from "../models/tweets.model.js";


// getting tweet contain from req.body
// finding the User in database
// creating a new tweet
// sending the response to frontend

// creating a new tweet of user in database
const tweetCreate = asyncHandler(async (req, res) => {
    const { content } = req.body; // exracting the content(tweet details) from req.boy

    if (!content) {
        throw new ApiError(404, "Tweet content required");
    }

    const User = req.user._id; // Get the user from the middleware ie (auth middle)
    if (!User) {
        throw new ApiError(401, "User not found");
    }

    // creating a new tweet
    const newTweet = await Tweets.create({
        content,
        owner: User // Use the authenticated user's ID
    });

    return res.status(201).json(
        new ApiResponse(201, {
            newTweet,
            message: "Tweet created successfully",
        })
    );
});

// getting tweets details from user
const GetCurrentUserTweets = asyncHandler(async(req , res) => {

    const userid = req.user._id; // getting the user from the middleware
    console.log("user found successsfully")
     if (!userid) {
        throw new ApiError(404 , "user not found")
     }
     
     try {
        // finding the user in database
        const UserTweets = await Tweets.find({owner: userid})
        
        return res.status(200).json(
            new ApiResponse(200 , {
                tweets: UserTweets,
                message: "User fetched successfully"
            })
        );
        
     } catch (error) {
        console.log(error , "unable to fetch user tweets")
        throw new ApiError(401 , "Error while fetching User tweets details")
     }
    
})

const updatetweet = asyncHandler(async (req, res) => {
    const { Newtweet } = req.body; // Extracting new tweet content from the request body
    if (!Newtweet) {
        throw new ApiError(404, "Tweet content required");
    }

    // Get the authenticated user's ID
    const UserId = req.user._id;
    if (!UserId) {
        throw new ApiError(404, "User not found!");
    }

    const tweetid = req.params.tweetId;

    // Finding the tweet and ensuring the user owns it
    const tweet = await Tweets.findOne({ _id: tweetid, owner: UserId });
    
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or you do not have permission to edit this tweet.");
    }

    // Updating the tweet content
    tweet.content = Newtweet;

    // Saving the updated tweet
    await tweet.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, "Tweet updated successfully"));
});


export {
   tweetCreate,
   GetCurrentUserTweets,
   updatetweet
}