import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import v1Router from './v1/index.js';

const apiRouter = Router();

// Version 1 Master Route (/api/v1/...)
apiRouter.use('/v1', v1Router);

// Root Health check endpoint (/api/health) for continuous telemetry probe backwards compatibility
apiRouter.use('/health', healthRoutes);

export default apiRouter;
