import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}))

app.use(express.json({ limit: "16kb" })) // Use to define the middlewear for send data in json format.
app.use(express.urlencoded({extended: true, limit: "16kb"})) // urlencoded(): Converts form data (like name=John&age=25) into a JavaScript object in req.body.
app.use(express.static("public")) // This line is used to serve static files (like images, PDF files, CSS files, or icons) directly to the user.
app.use(cookieParser())

export default app
// another way to export is :
// export {app}