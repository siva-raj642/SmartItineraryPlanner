import { Response } from 'express';
import { AuthRequest } from '../types';
import { getAllUsers as fetchUsers } from '../models/user.model';
import { db } from '../config/db';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const users = await fetchUsers();
  res.json(users);
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const [[userCount]]: any = await db.execute(
    `SELECT COUNT(*) as totalUsers FROM users`
  );

  const [[itineraryCount]]: any = await db.execute(
    `SELECT COUNT(*) as totalItineraries FROM itineraries`
  );

  res.json({
    totalUsers: userCount.totalUsers,
    totalItineraries: itineraryCount.totalItineraries
  });
};
