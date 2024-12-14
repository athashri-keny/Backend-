// // his code sets up file uploading in a Node.js application using the Multer library.
import express from "express";

const app = express();

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the destination folder for uploads
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
   cb(null , file.originalname)
    }
})

export const upload = multer({
    storage
})

