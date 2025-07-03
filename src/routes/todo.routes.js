import { Router } from "express";
import { createTodos,getTodos, updateTodos, deleteTodos } from "../controllers/todos.controllers.js";


const router = Router ();

router.route("/todo")
    .post(createTodos)
    .get(getTodos)
    
router.route("/todo/:id")
    .put(updateTodos)
    .delete(deleteTodos)


export default router