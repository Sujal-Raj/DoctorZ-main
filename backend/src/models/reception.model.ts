import mongoose, { mongo } from "mongoose";

const receptionSchema = new mongoose.Schema({
    receptionId:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    clinic:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "clinic",
        required:true
    }
},{timestamps:true})

const receptionModel = mongoose.model("reception",receptionSchema);

export default receptionModel;