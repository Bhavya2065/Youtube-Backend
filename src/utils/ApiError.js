class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something Went Wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }

/*
================================================================
EXPLANATION OF TERMINOLOGIES USED IN THIS FILE:
================================================================

1. class ApiError extends Error:
   - "class ApiError" creates a custom error blueprint.
   - "extends Error" means it inherits from Node.js's built-in Error class.

2. constructor:
   - A special method that runs automatically when we create a new error object using "new ApiError()".

3. Parameters:
   - statusCode: The HTTP status code of the error (like 400 for Bad Request, 404 for Not Found).
   - message: A description of what went wrong (defaults to "Something Went Wrong").
   - errors: An array to list multiple validation/input errors.
   - stack: The file path and line numbers where the error happened.

4. super(message):
   - Calls the constructor of the parent "Error" class to set the error message.

5. properties (this.statusCode, this.data, etc.):
   - statusCode: Saves the HTTP code inside the error object.
   - data: Used to store extra info (always set to null for errors).
   - message: Saves the error description text.
   - success: Set to false because this is an error.
   - errors: Saves the list of detailed errors.

6. Error.captureStackTrace:
   - A Node.js feature that records the exact line where the error occurred in the files.
*/