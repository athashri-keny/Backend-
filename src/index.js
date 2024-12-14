import connectDB from "../db/index.js";
import 'dotenv/config';
import { app } from "./app.js";

// Connect to the database first, then start the server
connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
