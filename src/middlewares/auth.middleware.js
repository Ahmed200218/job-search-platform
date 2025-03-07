import { User } from '../db/models/user.model.js';
import { asyncHandler } from '../utils/Errors/async-handler.js';
import { messages } from '../utils/Messages/index.js';
import { verify } from '../utils/index.js';

export const isAuthenticate = asyncHandler(async (req, res, next) => {
 

  const header = req.headers;
  let value
  if (!header.token) {
    value = header.authorization
  }
  else {
    value = header.token
  }
  
  if (!value) {
    return next(new Error(messages.user.tokenRequired, { cause: 400 }));
  }
  if (!value.startsWith("bearer")) {
    return next(new Error(messages.user.bearerInvalid, { cause: 400 }));
  }
  const token = value.split(" ")[1]; 
  const result = verify({token, secretKey: process.env.SECRET_JWT});
  if(result.error) return next(result.error);


  const userExist = await User.findById(result.id); 
  
  if (!userExist) {
    return next(new Error(messages.user.notFound, { cause: 404 }));
  }
  if (userExist.isDeleted === true) {
    return next(new Error("your account is freezed , please login first", {cause:400}))
  };

  if (userExist.deletedAt){
  if (userExist.deletedAt.getTime() > result.iat * 1000) {
    return next(new Error("invalid token", { cause: 400 }));
  }}
  req.authUser = userExist;
  return next();
})