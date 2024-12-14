import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
 // Make sure this is the correct import

const app = express();

// Middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true , limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from './routes/user.routes.js'; 
// Routes
app.use("/api/v1/users", userRouter); // it is compursary to use an middleware because the routes is in other folder futher this is send to user routes 

// http://localhost:3000/api/v1/users/register

export { app };
