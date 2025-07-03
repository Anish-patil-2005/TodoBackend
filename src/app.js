import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();


// .use is used for middleware and for configuration settings
app.use (cors({
    origin: process.env.CORS_ORIGIN, // frontend host link 
    credentials: true,
}))

// configuration

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser());


// routes import
import userRouter from "./routes/user.routes.js"
import todoRouter from "./routes/todo.routes.js"

// routes declaration
app.use("/api/v1/users/",userRouter)

app.use("/api/v1/todos",todoRouter)

export {app}