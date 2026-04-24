import express from 'express';

import { activateRegistrar, loginRegistrar } from '../controllers/registrarController.js';

const router = express.Router();

router.post('/activate', activateRegistrar);

router.post('/login', loginRegistrar);

export default router;
