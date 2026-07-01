import 'dotenv/config'
import connectDB from "./db/db_connection.js";

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