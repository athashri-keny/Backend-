// The auth midddleware is used for validating the if the User is validated or not 
// verify if is user is there or not 
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/async.handler.js';
import { ApiError } from '../utils/ApiError.js';
import { user } from '../models/user.model.js';

export const verifyjwt = asyncHandler(async (req, res, next) => {
    try {
        // Retrieve token from cookies or Authorization header
        const token =
            req.cookies?.accessToken ||
            req.header('Authorization')?.replace('Bearer ', '').trim();

        if (!token) {
            throw new ApiError(401, 'Unauthorized request: No token provided');
        }
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Find the user in the database
        const foundUser = await user.findById(decodedToken?._id).select('-password -refreshToken');

        if (!foundUser) {
            throw new ApiError(404, 'User not found');
        }
       
        // Attach the user object to the request
        req.user = foundUser;
        next();
    } catch (error) {
        // Pass the error to the Express error handler
        next(new ApiError(401, error?.message || 'Invalid access token'));
    }
});
