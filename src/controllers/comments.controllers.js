import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async.handler.js";
import {ApiError} from "../utils/ApiError.js"
import { Comment } from "../models/commet.model.js";
import mongoose from "mongoose";
import { user } from "../models/user.model.js";
// This function retrieves comments for a specific video.
const GetVideoComment = asyncHandler(async(req , res) => {
    const {VideoId} = req.params
    if (!VideoId) {
        throw new ApiError(404 , "Video ID is required!")
    }
    const {page = 1 , limit  = 10} = req.qurey

    const pageNum = parseInt(page , 10)
    const limitNum = parseInt(limit , 10)

    const Skip = (pageNum - 1) * limitNum

    const Comments = await  Comment.find({VideoId}
        .Skip(Skip)
        .limit(limitNum)
        .sort({ createdAt: -1})
    )

    return res
    .status(200)
    .json(
        {
         ApiResponse,
         page: pageNum,
         limit : limitNum,
         Comments,
    }
)
});

const ADDComments = asyncHandler(async(req , res) => {
    // find the User in database
    // take the videoId and Comment content from the req.body(User)
    // save the Comment in database
    // return response 
     const userID = req.user._id
     if (!userID) {
        throw new ApiError(400 , "User is required!")
     }
    const {VideoId} = req.params
    if (!VideoId) {
        throw new ApiError(404 , "Video Id incorrect")
    }

    const {Content} = req.body
    if (!Content) {
        throw new ApiError(404 , "Comments content required!!")
    }
     
    const User = await user.findById(userID)
    if (!User) {
        throw new ApiError(400 , "User not Found in database")
    } 

    // creating comment 
    const comment = await Comment.create({
        video : VideoId,
        owner: userID,
        content: Content
    })

    res.status(201).json({
        success: true,
        message: "Comment created successfully!",
        comment,
        ApiResponse, // Include this if it holds relevant data
    });
})

const UpdateComment = asyncHandler(async(req , res) => {
    // finding the User in database check wheater the user is login or not
    // taking the video id from database
    // finding the comment in database
    // taking the New Comment from the User 
    // saving the new as updatedcomment in database
    // returing the response to the user
    const userID = req.user._id

    const User = await user.findById(userID)
    if (!User) {
        throw new ApiError(400 , "User not Found in database")
    } 

    const {UpdatedComment} = req.body
    if (!UpdatedComment) {
        throw new ApiError(404 , "New comment Content required!")
    }

    const {CommentId} = req.params 
    if (!CommentId) {
        throw new ApiError(404 , "Comment Id required!")
    }
    const {VideoId} = req.params
    if (!VideoId) {
        throw new ApiError(404 , "Video id required!")
    }

   const comment = await Comment.findOneAndUpdate(
      {content: UpdatedComment ,
        video: VideoId,
        Owner: userID
      }
   )
    if (!comment) {
        throw new ApiError(404 , "something went Wrong while updating commnent!")
    }
    return res.status(200).json({
        success: true, // Indicates the update was successful
        message: "Comment updated successfully!", // Clear success message
        ApiResponse, // Include any API response data if necessary
        updatedComment: UpdatedComment, // Include the updated comment
    });
    
})

const DeleteComment = asyncHandler(async(req , res) => {
    const VideoId = req.params
    if (!VideoId) {
        throw new ApiError(404 , "Video ID is required!")
    }
    const CommentId = req.params
    if (!CommentId) {
        throw new  ApiError(400 , "Comment Id is required!")
    }

    const FindComment = await Comment.findOneAndUpdate({
         CommentId,
        video: VideoId
    })
    if (!FindComment) {
        throw new ApiError(404, "Cannot delete comment! Comment not found.");
    }

    return res
    .status(200)
    .json(
        ApiResponse , "comment deleted Sucessfully!"
    )
})

export {
    ADDComments,
    UpdateComment,
    DeleteComment
}


