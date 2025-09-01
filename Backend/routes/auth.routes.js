import express from 'express'
import authController from '../controllers/auth.controller.js'
import { upload } from '../middlewares/multer.middleware.js';
const router = express.Router(); 

router.post('/register', upload.single('avatar'), authController.registerUser); 
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword); 

export default router;