class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = []
    ) {
        super(message); // Call the parent class constructor
        this.statusCode = statusCode; // Correct property name
        this.message = message; // Set the error message
        this.success = false; // Indicate failure
        this.error = error; // Additional error details
    }
}

export { ApiError };
