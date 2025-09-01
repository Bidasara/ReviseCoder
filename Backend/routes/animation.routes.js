import express from "express";
import {upload} from "../middlewares/multer.middleware.js";
const router = express.Router();
import animation from "../controllers/animation.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

router.use(authenticateJWT);
router.post('/animPack/upload', upload.array(3), animation.uploadAnimation);
router.get('/anim', animation.getAllAnimationPacksForUserId);
router.get('/allAnim', animation.getAllAnimations);
router.post('/anim/purchase', animation.purchaseAnimation);

export default router;