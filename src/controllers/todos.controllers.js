import {Todo} from "../models/todo.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"

// 1. create todo
export const createTodos = asyncHandler(async(req,res)=>{
    const {title, description, status, priority, dueDate,tags, collaborators} = req.body

    if(!title)
    {
        throw new ApiError (400, "title is required");
    }

    const todo = await Todo.create({
        title,
        description,
        status,
        priority,
        dueDate,
        tags,
        collaborators,
        createdBy : req.user, // comes from JWT middleware
    })

    res.status(201)
    .json(new ApiResponse(201, todo, "Todo created successfully"));
});


// 2. get todos (Excluding deleted ones)

export const getTodos = asyncHandler( async(req,res)=>{
    const todos = await Todo.find(
        {
            createdBy: req.user
        },
        {
            isDeleted: false,
        }
    )

    res.status(200)
    .json(new ApiResponse(200,todos,"Fetched todos"))
    
})

// 3. update todos
export const updateTodos = asyncHandler(async (req,res)=>{
    const {id,title, description, status, priority, dueDate,tags, collaborators} = req.body // this is an input

    // this is what in my db
    const todo = Todo.findOne({
        _id:id,
        createdBy: req.user,
    })

    if(!todo || todo.isDeleted)
    {
        throw new ApiError(404, "Todo not found or unauthorized");
    }

    if(title != undefined) todo.title = title
    if (description !== undefined) todo.description = description;
    if (status !== undefined) todo.status = status;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (tags !== undefined) todo.tags = tags;
    if (collaborators !== undefined) todo.collaborators = collaborators;

    await todo.save();

    res.status(200).json(new ApiResponse(200, todo, "Todo updated successfully"));
})


// 4. deleteTodo
export const deleteTodos = asyncHandler(async(req,res)=>{
    const {id} = req.body;

    const todo = Todo.findOne({_id:id, createdBy:req.user})

    if (!todo || todo.isDeleted) {
        throw new ApiError(404, "Todo not found or already deleted");
    }

    todo.isDeleted = true,
    await todo.save();

    res.status(200).json(new ApiResponse(200, todo, "Todo deleted successfully"));
})
