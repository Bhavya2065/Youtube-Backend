import 'dotenv/config'
import connectDB from "./db/db_connection.js";
import app from './app.js';

// Aproach : 1

/*

import express from 'express'

const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("Error: ", error);
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is Listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("Error: ", error)
        throw error;
    }
})();

*/

// Aproach: 2

connectDB()
.then(() => {
    app.on("error", (error)  => {
        console.log("Error, ", error)
        throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at ${process.env.PORT || 8000}`)
    })
})
.catch((err) => {
    console.log(`DB connection failed!! `, err);
    
})