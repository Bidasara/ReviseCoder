import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/dashboard/:username', userController.getUserDashboard); 

router.use(authenticateJWT);
router.patch('/profile',authenticateJWT,userController.updateCurrentUserProfile);
router.delete('/account',authenticateJWT,userController.deleteAccount);
router.get('/cart',authenticateJWT,userController.getCart);
router.post('/cart/:animationId',authenticateJWT,userController.addToCart);
router.delete('/cart/:animationId',authenticateJWT,userController.removeFromCart);
router.patch('/addPixels',userController.addPixels);
router.delete('/removePixels',userController.removePixels);
router.patch('/markMilestoneDone/:id',userController.markMilestoneDone);
router.get('/getAllMilestones',userController.getAllMilestones);
router.get('/getMilestonesDone',userController.getAllMilestonesDone);


router.get('/',authenticateJWT,requireRole('admin'), userController.getAllUsers);
router.get('/:id',authenticateJWT, requireRole('admin'), userController.getUserById);
router.patch('/:id',authenticateJWT, requireRole('admin'), userController.updateUser);
router.delete('/:id',authenticateJWT, requireRole('admin'), userController.deleteUser);
export default router; 