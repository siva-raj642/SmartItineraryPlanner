import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getAllUsers, getAnalytics } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate);

router.get('/users', getAllUsers);
router.get('/analytics', getAnalytics);

export default router;
