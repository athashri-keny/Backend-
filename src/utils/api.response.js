// this code is for what to display after API success

class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // Corrected spelling and logic for success
    }
}

export { ApiResponse };


