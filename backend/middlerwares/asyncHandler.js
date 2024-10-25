const asyncHandler = (fun) => (req, res, next) => {
    Promise.resolve(fun(req, res, next)).catch((err) => {
      if (!res.headersSent) {
        res.status(500).json({ message: err.message });
        next(err)
      } else {
        console.error(err);
      }
    });
  };
  
  export default asyncHandler;