//For checklist items under a todo

import mongoose from "mongoose";

const subtodoSchema = new mongoose.Schema({
  task: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Todo", 
    required: true 
},
  
title: { 
    type: String, 
    required: true 
},
 completed: { 
    type: Boolean, 
    default: false 
},
});

export const Subtodo = mongoose.model("Subtodo", subtodoSchema);
