// env variable should available at every place needed, as soon as possible. -- config dotenv

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path:'./env'
})


connectDB()
.then(()=>{

    // to start the server
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at PORT: ${process.env.PORT}`);
    })

}).catch((err)=>{
    console.log("Mongo db connection failed", err);
})