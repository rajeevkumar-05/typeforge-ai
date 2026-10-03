import { Router } from 'express';
import { saveTest, getUserTests, getTestById, getTestStats } from '../controllers/testController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { saveTestValidator } from '../validators/testValidator';

const router = Router();

router.post('/', protect, saveTestValidator, validate, saveTest);
router.get('/', protect, getUserTests);
router.get('/stats', protect, getTestStats);
router.get('/:id', protect, getTestById);

export default router;
