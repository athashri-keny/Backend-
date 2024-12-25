import mongoose, { Schema } from "mongoose";

const LikesSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comments: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedby: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
} , {
    timestamps: true
}
)

export const Like = mongoose.model("Like" , LikesSchema)