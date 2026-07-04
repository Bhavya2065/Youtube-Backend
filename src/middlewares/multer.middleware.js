import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/tmp')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage })

/*
Detailed Explanation of this Multer Middleware:

1. Import Multer:
   We import the 'multer' library which helps us receive files from web forms.

2. Disk Storage (multer.diskStorage):
   This tells Multer to store uploaded files directly onto the server's disk (hard drive).

3. Destination Function:
   - Sets the folder where the files will be saved.
   - Here, it saves them in the './public/tmp' folder.
   - 'cb' is a callback function. We pass 'null' for no errors, and the folder path.

4. Filename Function:
   - Sets the name of the file when it is saved.
   - 'file.originalname' keeps the same name that the file had on the user's computer.

5. Export Upload:
   - We create the upload middleware using our storage configuration.
   - This can be imported into route files to handle file uploads.
*/