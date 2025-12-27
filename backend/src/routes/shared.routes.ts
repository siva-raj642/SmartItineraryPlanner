import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import * as controller from "../controllers/sharedItinerary.controller";

const router = Router();

router.use(authenticate);

// share itinerary
router.post("/share", controller.share);

// public list
router.get("/public", controller.getPublic);

// view single shared itinerary
router.get("/:id", controller.viewShared);

// like itinerary
router.post("/:id/like", controller.likeShared);

export default router;
