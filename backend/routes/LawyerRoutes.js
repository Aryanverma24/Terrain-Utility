import express from 'express';
import { authenticate } from '../middlerwares/authMiddlewares.js';
import { roleAuth } from '../middlerwares/roleAuth.js';
import {
  getPendingLands,
  approveOrRejectLand,
  assignLawyer,
  getCasesForLawyer,
} from '../controllers/LawyerController.js';

const router = express.Router();
//for cases
router.get('/:lawyerId/cases', authenticate, getCasesForLawyer);
// Only lawyers can access these routes
router.get('/pending', authenticate, roleAuth('lawyer'), getPendingLands);
router.put('/:landId/action', authenticate, roleAuth('lawyer'), approveOrRejectLand);
router.put('/:landId/assign', authenticate, roleAuth('lawyer'), assignLawyer);
export default router;
