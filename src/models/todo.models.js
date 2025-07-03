import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required:true,
            trim:true,
        },

        description:{
            type:String,
            trim:true,
        },

        status:{
            type:String,
            enum:["todo","in-progress","completed"],
            default:"todo"
        },
        priority:{
            type: String,
            enum:["low","medium","high"],
            default:"low"
        },

        dueDate:{
            type: Date,
        },

        tags:[{
            type: String,
        }],

        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },

        // multiple user can word on that todo
        collaborators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],


        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps:true,
    }
)

export const Todo = mongoose.model("Todo", todoSchema);
