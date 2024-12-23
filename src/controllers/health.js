import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async.handler.js";

const HealthCheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "🚀 System Operational: All systems are green and running flawlessly!"));
});

export {
    HealthCheck
};
