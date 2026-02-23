// backend/src/routes/documentRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { 
  uploadDocument, 
  getUserDocuments, 
  signDocument,
  deleteDocument,
  shareDocument,
  getPublicDocument // <-- 1. Import the new function
} from '../controllers/documentController';

const router = Router();

// 2. Put the public route BEFORE requireAuth!
router.get('/public/:token', getPublicDocument);

// Everything below this line requires the user to be logged in
router.use(requireAuth);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getUserDocuments);
router.post('/:id/sign', signDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/share', shareDocument);

export default router;