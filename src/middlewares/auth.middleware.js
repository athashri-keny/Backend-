import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/async.handler.js";
import jwt from "jsonwebtoken"
import { user } from "../models/user.model.js";


// verify if is user is there or not 

export const verifyjwt = asyncHandler(async(req , res , next) => {
  
  try {
    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "").trim(); // retrieve a token from either cookies or headers 
  
    if (!token) {
      throw new ApiError(401 , "unauthorized request")
    }
  // if token is there => 
      const decodedtoken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET) // verify that the token is correct
  
  // find the user in database 
     const User = await user.findById(decodedtoken?._id).select("-password -refreshToken" ) // returns an object
  
     if(!User) {
      throw new ApiError(404 , "user not found ")
     }

   // assgin the User in req.user for use 
     req.User = User
    next()

  } catch (error) {
    throw new ApiError(401 , error?.message || "invaild access token" )
  }
})