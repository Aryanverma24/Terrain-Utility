import express from 'express';

import { activateRegistrar, assignRegistrarToLand, loginRegistrar } from '../controllers/registrarController.js';
import { authenticate, authenticateRegistrar } from '../middlerwares/authMiddlewares.js';

const router = express.Router();

router.post('/activate', activateRegistrar);

router.post('/login', loginRegistrar);
router.post("/assign", authenticate, assignRegistrarToLand);
export default router;
