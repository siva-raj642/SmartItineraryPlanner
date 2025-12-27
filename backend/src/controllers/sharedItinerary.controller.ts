import { Response } from "express";
import { AuthRequest } from "../types";
import * as Shared from "../models/sharedItinerary.model";
import * as Itinerary from "../models/itinerary.model";

export const share = async (req: AuthRequest, res: Response) => {
  try {
    const { itinerary_id, title, description } = req.body;
    const itinerary = await Itinerary.getItineraryById(itinerary_id);
    if (!itinerary) return res.status(404).json({ message: "Itinerary not found" });

    if (itinerary.user_id !== req.user!.id)
      return res.status(403).json({ message: "Not allowed" });

    await Shared.shareItinerary({
      user_id: req.user!.id,
      itinerary_id,
      title,
      description
    });

    res.status(201).json({ message: "Itinerary shared publicly" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Share failed" });
  }
};

export const getPublic = async (_req: any, res: Response) => {
  const result = await Shared.getPublicSharedItineraries();
  res.json(result);
};

export const viewShared = async (req: any, res: Response) => {
  const shared = await Shared.getSharedById(+req.params.id);
  if (!shared) return res.status(404).json({ message: "Not found" });

  await Shared.incrementView(+req.params.id);
  res.json(shared);
};

export const likeShared = async (req: any, res: Response) => {
  await Shared.likeShared(+req.params.id);
  res.json({ message: "Liked" });
};
