import { Router } from 'express';
const router = Router();

import mocksController from '../controllers/mocks.controller.js';

router.get('/mockingpets', mocksController.getMockingPets);

router.get('/mockingusers', mocksController.getMockingUsers);

router.post('/generatedata', mocksController.generateData);




export default router;
