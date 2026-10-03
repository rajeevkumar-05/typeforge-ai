import { Router } from 'express';
import { getProfile, updateProfile, updatePreferences } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);

export default router;
