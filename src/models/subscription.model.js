import mongoose ,  {Schema} from "mongoose";

const subscriptionschema = new Schema({
subcriber: {
    type: Schema.Types.ObjectId, // one who is subscribing
    ref: "User"
},

channel: {
    type: Schema.Types.ObjectId, // one whom is subscriber is subscribing 
    ref: "User"
    
}
} , {timestamps: true})

export const Subscription = mongoose.model("Subscription" ,
     subscriptionschema)


    // to find the channel subcriber we need to find in the channel name in docment cause everytime a user subs a new document is created
    // channel === subcribers counts 
    // subcribers == how many channels a user had subcribed 