import { Router } from "express";
import { predictionController } from "../controllers/predictionController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication and vendor role
router.post("/", authenticate, predictionController.requestForecast);
router.get("/product/:productId", authenticate, predictionController.getPredictions);
router.get("/vendor", authenticate, predictionController.getVendorPredictions);
router.post("/batch", authenticate, predictionController.batchRequestForecast);
router.get("/models", authenticate, predictionController.getModelInfo);
router.get("/metrics", authenticate, predictionController.getMetrics);

export default router;
