
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((error) => {
      console.log(error);
      
      return new Error(next({message:error.message})); 
    });
  };
};