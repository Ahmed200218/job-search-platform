import { Router } from "express";
import { isAuthenticate } from "../../middlewares/auth.middleware.js";
import * as chatService from "./chat.service.js";
import { asyncHandler } from "../../utils/index.js";

const router = Router();

router.get("/history/:userId", isAuthenticate, asyncHandler(chatService.getChatHistory));



export default router;