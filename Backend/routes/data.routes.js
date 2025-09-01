import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import dataController from '../controllers/data.controller.js';
// import { requireRole } from '../middlewares/authMiddleware';

const router = express.Router();
router.get('/recomLists', dataController.getRecommendedLists); 
router.get('/allProblems', dataController.getAllProblems);
router.use(authenticateJWT);
router.get('/getAllLists', dataController.getAllListsByUserId);
router.post('/addList', dataController.addListForUserId);
router.post('/addRecomList', dataController.addRecomListForUserId);
router.delete('/deleteList', dataController.deleteList);
router.patch('/addCategory', dataController.addCategoryForList);
router.delete('/deleteCategory', dataController.deleteCategory);
router.patch('/addProblem', dataController.addProblemForCategory);
router.delete('/deleteProblem', dataController.deleteProblem);
router.patch('/markRevised', dataController.markRevisedProblem);
router.get('/getNotes', dataController.getNotesByUserProblem);
router.patch('/submit', dataController.markSolvedWithNotes);
router.patch('/updateNotes', dataController.updateNotes);
router.get('/reviseList', dataController.getReviseListByUserId);
router.get('/solvedAndRevised',dataController.getSolvedAndRevised)
router.get('/hint',dataController.getHint);

export default router; 