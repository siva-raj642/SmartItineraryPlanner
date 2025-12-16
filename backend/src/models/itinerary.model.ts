import { db } from '../config/db';

export const createItinerary = async (data: any) => {
  const sql = `
    INSERT INTO itineraries 
    (user_id, destination, start_date, end_date, budget, preferences, activities, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return db.execute(sql, [
    data.user_id,
    data.destination,
    data.start_date,
    data.end_date,
    data.budget,
    data.preferences,
    data.activities,
    data.notes
  ]);
};

export const getItinerariesByUser = async (userId: number) => {
  const sql = `SELECT * FROM itineraries WHERE user_id = ?`;
  const [rows] = await db.execute(sql, [userId]);
  return rows;
};

export const getItineraryById = async (id: number) => {
  const [rows]: any = await db.execute(
    `SELECT * FROM itineraries WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const updateItinerary = async (id: number, data: any) => {
  const sql = `
    UPDATE itineraries
    SET destination=?, start_date=?, end_date=?, budget=?, preferences=?, activities=?, notes=?
    WHERE id=?
  `;
  return db.execute(sql, [
    data.destination,
    data.start_date,
    data.end_date,
    data.budget,
    data.preferences,
    data.activities,
    data.notes,
    id
  ]);
};

export const deleteItinerary = async (id: number) => {
  return db.execute(`DELETE FROM itineraries WHERE id = ?`, [id]);
};
