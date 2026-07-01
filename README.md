# Youtube-Backend
A scalable YouTube backend featuring authentication, video uploads, playlists, comments, likes, and subscriptions.

## Setup

### Environment Variables
Create a `.env` file in the root folder and add:
```env
PORT=8000
MONGO_URL=your_mongodb_connection_string
```

### Important: MongoDB Password Issue
If your MongoDB password has an `@` symbol (like `pass@123`), you must replace `@` with `%40` in the connection string.

**Example:**
* Password: `myPassword@95`
* Connection URL: `mongodb+srv://user:myPassword%4095@cluster.mongodb.net`

### Important: File Extensions in Imports
This project uses ES Modules. You must always include the `.js` file extension when importing local files.

**Example:**
```javascript
// Correct
import connectDB from "./db/db_connection.js";

// Incorrect (causes error)
import connectDB from "./db/db_connection";
```

