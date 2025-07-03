// Not provided by nodeJS , so create your own class to response

class ApiResponse {
    constructor(
        statusCode,
        data,
        message = "Success"
    ){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = this.statusCode < 400    
    }
}

export {ApiResponse}