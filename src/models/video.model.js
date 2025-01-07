import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // Cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, // Cloudinary URL
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    time: {
      type: String, // Use a more specific format (e.g., Date or Duration string) if needed
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    }, 
    likes : {
      type : Number,
      default : 0,
  },
    isPublished: {
      type: Boolean,
      default: true, // Ensure the spelling is "isPublished" (you had "isPulished")
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true, // Assuming every video must have an owner
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);



videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
