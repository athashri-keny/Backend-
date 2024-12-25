import { asyncHandler } from "../utils/async.handler.js";  
import { ApiError } from "../utils/ApiError.js";
import {user} from "../models/user.model.js" // direct contact from database 
import { uploadoncloud } from "../utils/file.upload.js";
import { ApiResponse } from "../utils/api.response.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';

// access and refresh token generator 
const generateaccessandRefreshtokens = async(UserId) => { 
    try {
     const User = await user.findById(UserId) // find the user based on userID given
      const accesstoken = User.generateAccessToken() // generate access token for user
      const refreshToken = User.generateRefreshToken() // generate refresh token for user

      User.refreshToken = refreshToken    // saving the refreshtoken in server
     await User.save({ validateBeforeSave: false}) // before removes schema validation 

     return {accesstoken , refreshToken} 

    } catch (error) {
        console.error("Error in generateaccessandRefreshtokens:", error);
        throw new ApiError(500 , "Something went wrong")
    }
}
// register user
// Define the registerUser route handler
const registerUser = asyncHandler(async (req, res) => {
      const {fullname , email , username , password} = req.body

 // Checks if any field is empty.
      if(
[fullname , email , username , password].some((field) => field?.trim() === "") 
      ) {
throw new ApiError (400 , "all fields are required")
      }

// check for existing user 
   const existeduser =   await user.findOne({
        $or: [{ username } , { email }]
      })
      if (existeduser) {
        throw new ApiError(409, "Username/ Email already exist")
      }

// Extracts the file paths for the uploaded avatar and cover image.
    const avatarLocalPath =  req.files?.avatar[0]?.path; 

let coverImageeLocalpath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageeLocalpath = req.files.coverImage[0].path
}
    
if (!avatarLocalPath) {
    throw new ApiError(400 , "avatar file is required")
}   

// uploading files to cloud 
 const avatar = await uploadoncloud(avatarLocalPath)
  const coverImage = await uploadoncloud(coverImageeLocalpath)
  if(!avatar) {
    throw new ApiError(400 , "avatar file is required")
  }

  // creating a new user
   const User = await user.create({
        fullname,
        avatar: avatar.url , 
        coverImage: coverImage?.url || "",
        email , 
        password,
        username: username.toLowerCase() // Stores the avatar and cover image URLs from the cloud
    })


// Fetching the Created User
const createdUser =  await user.findById(User._id).select( // double checks the operation 
    "-password -refreshToken"
)
if(!createdUser) {
    throw new ApiError(500 , "something went wrong for registering user")
}
return res.status(201).json(
    new ApiResponse(200 , createdUser , "User registeres successfully")
)
});

// login user
const loginUser = asyncHandler(async(req , res) => {
// req body -> data
// username or email
// find the user 
// password check
// access and refresh token
// send cookies

// request from user email , password , username 
const {email , username , password} = req.body
if (!username && !email) {
    throw new ApiError(400 , "Username or password is required")
}

// find the user in database
    const User = await user.findOne({
    $or: [{username} , {email}]
  })
     if (!User) {
        throw new ApiError(404 , "user not found")
     }

 // check the password 
    const isPasswordVaild =  await User.isPasswordCorrect(password)
    if (!isPasswordVaild) {
        throw new ApiError(401 , "Invaild user credentials")
     }  
     // check access and refresh token
     const {accesstoken , refreshToken} =  await generateaccessandRefreshtokens(User._id)

     // finding the user 
      const loggenInsuser = await user.findById(User._id) // returns a object because whenever we questions the database
     .select("-password -refreshToken") // removing the sensitive information

      // cookies options 
      const options = {
        httpOnly: true,
        secure: true
      }
      // send response 
      return res
      .status(200)
      .cookie("accessToken" , accesstoken , options)
      .cookie("refreshToken" , refreshToken , options)
      .json(
        new ApiResponse( 200 , {
            user: loggenInsuser , accesstoken , refreshToken
        },
        "user loggin in successfully"
    )
      )
})

//  to login out user
const logoutUser = asyncHandler(async(req ,res ) => {
  await user.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: 1
            }
        }, {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
      }

      return res
      .status(200)
      .clearCookie("accessToken" , options)
      .clearCookie("refreshToken" , options)
      .json(new ApiResponse(200 , {} , "user logout sucessfully"))
})

// genrating new accesstoken if the user's accesstoken expiryed 
const refreshTokenAccessToken = asyncHandler(async( req , res) => {
    
 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //Extracting the refreshToken from the User
 if (!incomingRefreshToken) {
    throw new ApiError(401 , "unauthorized request")
 }
 
 // Verifying the Refresh Token with the server's refresh token 
try {
  const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFESH_TOKEN_SECRET);

   //  Finding the User in the Database
     const User =  await user.findById(decodedToken?._id)
     if (!User) {
        throw new ApiError(401 , "Invaild refresh Token")
     }
     // Checking Refresh Token Validity
     if (incomingRefreshToken !== User?.refreshToken) {
        throw new ApiError(401 , "refresh Token expired or used")
     }

 // Options for Cookies
     const options = {
        httpOnly: true,
        secure: true
     }
// . Generating New Tokens
     const {accesstoken , newrefreshToken} =  await generateaccessandRefreshtokens(User._id)
     // Sending the New Tokens Back
      return res
      .status(200)
      .cookie("accessToken" , accesstoken , options)
      .console("refreshToken" , newrefreshToken , options)
      .json(
        new ApiResponse(200 , {accesstoken , newrefreshToken},
            "Acess token refreshed"
        )
      )
} catch (error) {
    throw new ApiError (401 , error?.message || "invaild refresh token")
}
})

// changing the User password
const changerCurrentUserPassword = asyncHandler(async(req, res) => {
    const {oldPassword , newPassword} = req.body // extracting the user oldpassword and new password

// finding the user in database 
  const User =  await user.findById(req.user?._id)
    const isPasswordCorrect = await User.isPasswordCorrect(oldPassword) // checking the password correct that user has inentered(oldpassword)

    if(!isPasswordCorrect) {
        throw new ApiError (400 , "Invaild old password")
    }
 // saving the new password 
    User.password = newPassword // saving the password in User 
     await User.save({validateBeforeSave: false})
     return res
     .status(200)
     .json(new ApiResponse(200, {} , "password change sucessfully"))
})


// to get Current User Information 
const getcurrentUser = asyncHandler(async(req , res ) => {
     const currentUser = req.user._id
     if (!currentUser) {
        throw new ApiError(404 , "user not found")
     }
     return res
     .status(200)
     .json(new ApiResponse(200, req.user, "User fetched successfully"));
 });



// Update accounts details eg fullname , email 
const updateAccountDetails = asyncHandler(async(req , res) => {
    const {fullname , email} = req.body // take data from user 

    if (!fullname  || !email) {
        throw new ApiError(400 , "All fields are requried")

    }
      const User =  await user.findByIdAndUpdate(
        req.user?._id, 
        {
            $set: {
                fullname: fullname,
                email: email
            }
        }, 
        {new: true} // return the information which is updated now

    ).select("-password")
    // return the response to user
    return res
    .status(200)
    .json(new ApiResponse(200 , User , "account details updated succesfully"))

})

// updating tge User avatar (profile photo)
const updateUserAvatar = asyncHandler(async(req , res) => {

const avataRLocalPath = req.file?.path // extracting the file path from req.files 
if(!avataRLocalPath) {
    throw new ApiError(400 , "avatar file is required")
}

// Fetch the user to get the old avatar URL
const CurrentUser = await user.findById(req.user._id)
if(!CurrentUser) {
    throw new  ApiError(404 , "user not found")
}

const oldavatarUrl = CurrentUser.avatar
 // uploads the file to the cloud, and returns an object with the uploaded file's details.
 const avatar = await uploadoncloud(avataRLocalPath)
 if (!avatar.url) {
    throw new ApiError(400 , "error while uploading on avatar")
 }

 if(oldavatarUrl) {
    try {
        const publicId = oldavatarUrl.split("/").pop().split(".")[0]; // Extracts the file name without extension
        await cloudinary.uploader.destroy(publicId); // Deletes the file from Cloudinary
    } catch (error) {
        console.log(error , "cloudnt delete old user url")
    }

 }
 // Find the user by ID and update their avatar
  const User = await user.findByIdAndUpdate(
    req.user?._id,
   
    {
        $set: {
            avatar:avatar.url // // Updating the avatar field with the cloud URL
        } 
    },
    {new: true}
 ).select("-password") 

 
 // // Exclude the password field for security
 // return response 
return res
.status(200)
.json(
    new ApiResponse(200 , User , "avatar updated sucessfully")
) })


// updating the user cover img (same process as the avatar one)
const updateUserCoverImg = asyncHandler(async(req , res) => {

    const oldupdateUserCoverImg = req.file?.path
    
    if(!oldupdateUserCoverImg) {
        throw new ApiError(400 , "cover file is required")
    }
     const newcoverImage  = await uploadoncloud(oldupdateUserCoverImg)
     if (!newcoverImage.url) {
        throw new ApiError(400 , "error while uploading on cover")
     }
    
     if (oldupdateUserCoverImg) {
        try {
            const publicId = oldupdateUserCoverImg.split("/").pop().split(".")[0]; // Extracts the file name without extension
            await cloudinary.uploader.destroy(publicId); // Deletes the file from Cloudinary
        } catch (error) {
            console.log(error , "error while deleting the old cover image file")
        }
     }

      const User = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: newcoverImage.url
            }
        },
        {new: true}
     ).select("-password")
     

    return res
    .status(200)
    .json(
        new ApiResponse(200 ,  User , "coverimage updated sucessfully")
    )
})


const getUserChannelProfile = asyncHandler(async(req , res) => {
     const {username} = req.params // params means URl 
     if(!username?.trim()) {
        throw new ApiError(400 , "Username is missing")
     }
    
       const channel = await user.aggregate([
        {
           // Finds the user whose username matches the one provided in the URL.
            $match: {
                username:username?.toLowerCase()
            }
        },
        // Lookup the channel's subscribers
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id,",
                foreignField: "channel",
                as: "subcribers"
            }
            // Lookup channels the user subscribed to
        }, {
            $lookup: {
                from: "subscriptions",
                localField: "_id,",
                foreignField: "subcriber",
                as: "subcribedto"
            }
            // Add calculated fields
        }, { 
            $addFields: {
                subscibersCount: {
                    $size: "$subcribers" // Counts the number of subscribers.
                },
                channelssubscribedtoCount: { 
                    $size: "$subcribedto" // Counts the number of channels the user has subscribed to
                },

//  Checks if the logged-in user (req.User?._id) is in the list of subscribers.
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.User?._id , "$subcribers.subcriber"]}, // $in checks if value exists in array
                        then: true,
                        else: false
                    }
                }
            }
            // Project the final result
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                subscibersCount: 1,
                channelssubscribedtoCount: 1,
                isSubscribed: 1, 
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
       ])
         //  Handle if No User Found
       if(!channel?.length) {
        throw new ApiError(404 , "channel does not exist")
       }

       return res
       .status(200)
       .json(
        new ApiResponse(200 , channel[0] , "user fetched successfully")
       )
})

const GetWatchHistory = asyncHandler(async(req , res) => {
    // mongoose
    const User = await user.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        // going from User to watchHistory in Videos model
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "Watchhistory",
                // looking in the vidoes model and finding ther owner this is called nested 
                pipeline: [
                    {
                        $lookup:{
                            from: "User", 
                            localField: "owner", 
                            foreignField: "_id",
                            as: "owner",
                            // filtering the main values and projecting it as the User
                            pipeline: [
                                {
                                $project: {
                                  fullname: 1,
                                  avatar: 1,
                                  username: 1,  
                                }
                            },
                            // it by default returns an arrays this code will output object
                            {
                                $addFields: {
                                    owner: {
                                        $first: "$owner"// used for projecting the arrays
                                    }
                                }
                            }
                        ]
                        }
                    }
                ]
            }
        }
    ])
    return res
.status(200)
.json(
    new ApiResponse(
        200,
        User[0].watchHistory,
        "watch history fetched successfully"
    )
)
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshTokenAccessToken,
    changerCurrentUserPassword,
    getcurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImg,
    getUserChannelProfile,
    GetWatchHistory
 }; 

        
//  get details from users i.e from postman (frontend) 
// validation  -  if should not be empty
// check if user already exists from username , email,
// check for images , check for avatar 
// upload them to cloundinary , avatar
// create user object - create entry in database
// remove password and refresh token field from response
// check for user creation if created for not
// return response     


