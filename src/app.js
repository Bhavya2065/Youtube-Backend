import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Routes import
import userRouter from './routes/user.routes.js'

// Routes declaration
app.use("/api/v1/users", userRouter)

export default app

/*
================ NOTES ================
1. cors(): Middleware to allow requests from different origins (like your frontend).
2. express.json(): Middleware to parse incoming requests with JSON data.
3. express.urlencoded(): Converts URL-encoded form data (like name=John&age=25) into a JavaScript object in req.body.
4. express.static("public"): Serves static assets (images, PDFs, etc.) directly from the 'public' folder.
5. cookieParser(): Allows the server to read and set cookies in the user's browser.
6. Routes:
   - We use "/api/v1/users" as the base path for user routes (standard API versioning practice).
   - Example: A POST request to "/api/v1/users/register" will go to registerUser.
   - For new routes (like login), just add them in 'user.routes.js' without changing app.js.
7. export default app: Exports the Express application so it can be imported and started in other files (like index.js).
*/