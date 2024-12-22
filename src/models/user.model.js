import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userschema = new Schema(
    {
username: {
    type:String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
},
email: {
    type:String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true,
},
fullname: {
    type:String,
    require: true,
    trim: true,
    index: true,
},
avatar: {
    type:String,
    required: true,
},
coverImage: {
    type: String,
},
watchHistory: [
    {
        type: Schema.Types.ObjectId,
        ref: "video"
    }
],
password: {
    type: String,
    required: [true , "password is required"]
},
refreshToken: {
    type:String,
}
},
 {
    timestamps: true
}
)

             // HOOKS
 
// this line  is a middleware to brcpt the password before saving from user 
userschema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();

 // Hash the password using bcrypt before saving
    this.password = await bcrypt.hash(this.password, 10)
    next() //process to the next middleware save the documents
})

//compares if the the user has entered the correct passwoord
userschema.methods.isPasswordCorrect = async function(password) {
     return await bcrypt.compare(password , this.password)
}
// Method to generate an access token (JWT) for the user UNIQUE
userschema.methods.generateAccessToken = function() { // accesstoken
     return jwt.sign(
        {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname : this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
)
}
// Method to generate an refresh token (JWT) for the user
userschema.methods.generateRefreshToken = function() { // refresh token 
    return jwt.sign(
        {
            
        _id: this._id,
    },
    process.env.REFESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFESH_TOKEN_EXPIRY,
    }
)
}
export const user = mongoose.model("User" , userschema) // this user can be direct contact to the database because it is created by mongoose 

