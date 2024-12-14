import { asyncHandler } from "../utils/async.handler.js";  
import { ApiError } from "../utils/ApiError.js";
import {user} from "../models/user.model.js" // direct contact from database 
import { uploadoncloud } from "../utils/file.upload.js";
import { ApiResponse } from "../utils/api.response.js";


// access and fresh token generator 
const generateaccessandRefreshtokens = async(UserId) => { 
    try {
         const user = await user.findById(UserId) // find the user based on userID given
      const accesstoken = user.generateAcessToken() // generate access token for user
      const refreshToken = user.generateRefreshToken() // generate refresh token for user

      user.refreshToken = refreshToken    // saving the refreshtoken in server
     await user.save({ validateBeforeSave: false}) // before removes schema validation 

     return {accesstoken , refreshToken} 

    } catch (error) {
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
    //  const coverImageeLocalpath = req.files?.coverimage[0]?.path;
     
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
console.log(req.files)
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
if (!username || !email) {
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

     const {accesstoken , refreshToken} =  await generateaccessandRefreshtokens(user._id)

      const loggenInsuser = await User.findById(user._id)
      select("-password -refreshToken")
      
      const options = {
        httpOnly: true,
        secure: true
      }
      
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
                refreshToken: undefined
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
      .clearCokie("accessToken" , options)
      .refreshToken("refreshToken" , options)
      .json(new ApiResponse(200 , {} , "user logout sucessfully"))
})

export { 
    registerUser,
    loginUser,
    logoutUser
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