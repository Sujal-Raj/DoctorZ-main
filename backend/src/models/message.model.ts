import mongoose from "mongoose";
// import { text } from "stream/consumers";

export interface message extends Document{
    roomId:string,
    senderId:string,
    text:string,
    type:string,
    readBy:string,
    edited:boolean,
    deleted:boolean,
    createdAt:Date,

}

const messageSchema = new mongoose.Schema({
    roomId:{
        type:String,
        required:true
    },
    senderId:{
        type:String,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    type:{
        type:String,
    },
    readby:{
        type:String,
    },
    edited:{
        type:Boolean,
    },
    deleted:{
        type:Boolean,
    },
    createdAt:{
        type:Date,
        default:new Date(),
    }

})

const messageModel = mongoose.model("messages",messageSchema);

export default messageModel;