const asyncHandler = (fun) => (req,res,next) => {
    Promise.resolve(fun(req,res,next)).catch((err) => {
        res.status(500).json({message :  err.message});
    });
}

export default asyncHandler;