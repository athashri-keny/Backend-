// This code is written for middleware to handle asynchronous errors. 
// The `next` function passes any error to the next error-handling middleware.
// asynchandler is a just like a template and not to try or catch function every time 
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
         Promise.resolve(requestHandler(req, res, next))
             .catch((err) => next(err));
     };
 };
 
 export { asyncHandler };


// const asnchandlerr = (fn) =>  async(req , res ,next) => {
//     try {
//         await fn(req , res , next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         }) 
//     }

