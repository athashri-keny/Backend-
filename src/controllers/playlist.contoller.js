import mongoose , {isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/api.response.js"
import {asyncHandler} from "../utils/async.handler.js"
import {user} from "../models/user.model.js"
import {Video} from "../models/video.model.js"

// creating a playlist 
const CreatePlaylist = asyncHandler(async(req , res) => {
       const {name , description} = req.body

       if(!name || !description) {
        throw new ApiError (404 , "name and description of the playlist is required")
       }

       const User = await user.findById(req.body._id)
    if(!User) {
        throw new ApiError(404 , "User not found")
    }
    
    const newplaylist = await Playlist.create({
        name,
        description,
        owner: User,
        vidoes
    })

    return res
    .status(201)
    .json(200 ,{
        name,
        description,
       message: "Playlist created sucessfully!",
       vidoes: newplaylist.vidoes
    })
}
)

const getUserplaylists = asyncHandler(async(req , res) => {
      // to get User id from Url use req.params
      // finding the user 
    const {userID} = req.params
    if(!userID) {
        throw new ApiError(404 , "User id not found")
    }

     // finding the playlist
      const UserPlaylist = await Playlist.find({owner: userID})

      if(!UserPlaylist) {
        throw new ApiError(404 , "User has Playlist not found!")
      }

  return res
  .status(200)
  .json({
    status: 200,
    data: UserPlaylist,
    message: "User playlist fetched Sucessfully"
  })
}
)

// getting the playlist id of the created User 
const GetPlaylistID = asyncHandler(async(req , res ) => {
     // extracting the playlist id from User
    const {PlaylistId} = req.params
    if(!PlaylistId) {
        throw new ApiError(400 , "Playlist Id not Found")
    } 

   // finding the playlist id in database
    const playlist = await Playlist.findById(PlaylistId)
    if(!playlist) {
        throw new ApiError(404 , "Playlist ID incorrect or not found!")
    }
    // returning the response to User  
    return res
    .status(200)
    .json({
        status:200,
        data: playlist,
        message: "Playlist Id fetched successfully" 
    }) 
})


const addvidoeToPlaylist = asyncHandler(async(req , res) => {
    const {PlaylistId , videoID} = req.params
    if (!PlaylistId || !videoID) {
      throw new ApiError(404 , "PLaylist and videoID required!!")        
    }
      
    const playlist = await Playlist.findById(PlaylistId)
    const Videos = await Video.findById(videoID)

    if (!playlist || !Videos) {
        throw new ApiError(404 , "Playlist and video id not found")
    }
    
    await Playlist.findByIdAndUpdate(
        PlaylistId, // This is the ID of the playlist you want to update.
        {$addtoSet: {Videos: videoID}}, //  The $addToSet operator is used to add a value to an array
        {new : true} // returns the value 
    )

    try {
        await Playlist.save()
    } catch (error) {
        console.log(error , "error while saving the playlist")
    }

    return res
    .status(200) // Correct status code for success
    .json(
        new ApiResponse(200, {
            playlist, // Include the playlist in the response
            message: "Videos added to playlist successfully" // Add a descriptive message
        })
    );

    // take playlist and videoid from user
    // finding the playlistid and videoid in database (if it is there or not)
    // adding the videosid in the playlistid 
    // saving the vidoes in the playlist 
    // returing the response to the user
})

const removevideofromplaylist = asyncHandler(async(req , res) => {
    // check if the playlist and video id are vaild
    // finding the playlistid and videoid in database 
    // removing the video from playlist 
    // saving the playlist
    // returing the response to user 

    const {PlaylistId , videoID} = req.params
    if (!PlaylistId || !videoID) {
        throw new ApiError(404 , "Playlist and videoId not found")
    }

    // checking if the playlist id and video id are vaild
    if(!mongoose.Types.ObjectId.isValid(PlaylistId) || !mongoose.Types.ObjectId.isValid(videoID)) {
        throw new ApiError(404 , "Video and playlist id are not valid")
    }

    // finding the playlist and video in database
    const playlist = await Playlist.findById(PlaylistId)
    if (!playlist) {
        throw new ApiError(404 , "Playlist id invaild")
    }
    const videos = await Video.findById(videoID)
    if(!videos) {
        throw new ApiError(404 , "Vidoes Id is invaild")
    }

     // removing the video from playlist
    const playlistt = await Playlist.findByIdAndUpdate(
        PlaylistId,
        { $pull: { Videos: videoID } }, // Removes the videoId from the videos array
        { new: true } // Returns the updated document
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200 , playlistt , "Video removed from playlist successfully")
    )
})


const updatePlaylist = asyncHandler(async(req , res)=> {
// taking the playlistId from User
// taking the name and description from user
// finding the PLaylist ID in data base 
// updating the video in playlist by using the $Push method of database
// returning the response to the user
    const {PlaylistId} = req.params
    if (!PlaylistId) {
        throw new ApiError(404 , "Playlist Id not found")
    }
    const { videoID , name , description } = req.body
    if (!name || !description || !videoID) {
        throw new ApiError(404 , "Name , description and videoId of the video is required!")
    }
   
   const playlist = await Playlist.findById(PlaylistId)
   if (!playlist) {
     throw new ApiError(404 , "playlist is incorrect")
   }

  const UpdatedPlaylist =  await Playlist.findByIdAndUpdate(
    PlaylistId,
    {$push: {videos: videoID}},
    {new: true}
   )

   return res
   .status(200)
   .json(
    new ApiResponse(200 , UpdatedPlaylist , "Video added successfully to the Playlist!")
   )
})


export {
    CreatePlaylist,
    getUserplaylists,
    GetPlaylistID,
    addvidoeToPlaylist,
    removevideofromplaylist,
    updatePlaylist
}

