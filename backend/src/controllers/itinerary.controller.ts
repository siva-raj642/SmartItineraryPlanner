import { Response } from 'express';
import { AuthRequest } from '../types';
import * as Itinerary from '../models/itinerary.model';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { destination, start_date, end_date, budget } = req.body;

    if (!destination || budget <= 0 || start_date > end_date) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    await Itinerary.createItinerary({
      ...req.body,
      user_id: req.user!.id
    });

    res.status(201).json({ message: 'Itinerary created' });
  } catch {
    res.status(500).json({ message: 'Creation failed' });
  }
};

export const getAll = async (req: AuthRequest, res: Response) => {
  const data = await Itinerary.getItinerariesByUser(req.user!.id);
  res.json(data);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.getItineraryById(+req.params.id);

  if (!itinerary) {
    return res.status(404).json({ message: 'Not found' });
  }

  if (
    itinerary.user_id !== req.user!.id &&
    req.user!.role !== 'ADMIN'
  ) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(itinerary);
};

export const update = async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.getItineraryById(+req.params.id);

  if (itinerary.user_id !== req.user!.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await Itinerary.updateItinerary(+req.params.id, req.body);
  res.json({ message: 'Updated' });
};

export const remove = async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.getItineraryById(+req.params.id);

  if (itinerary.user_id !== req.user!.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await Itinerary.deleteItinerary(+req.params.id);
  res.json({ message: 'Deleted' });
};
