import {db} from "../config/db";

export const shareItinerary = async (data: any) => {
  const sql = `
    INSERT INTO shared_itineraries 
    (user_id, itinerary_id, title, description) 
    VALUES (?, ?, ?, ?)
  `;
  return db.execute(sql, [
    data.user_id,
    data.itinerary_id,
    data.title,
    data.description || null
  ]);
};

export const getPublicSharedItineraries = async () => {
    
  const [rows] = await db.execute(
    `SELECT s.*, u.name, i.destination, i.budget 
     FROM shared_itineraries s
     LEFT JOIN users u ON s.user_id = u.id
     LEFT JOIN itineraries i ON s.itinerary_id = i.id
     WHERE s.is_public = 1
     ORDER BY s.created_at DESC`
  );
  return rows;
};

export const getSharedById = async (id: number) => {
  const [rows]: any = await db.execute(
    `SELECT * FROM shared_itineraries WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const incrementView = async (id: number) => {
  return db.execute(
    `UPDATE shared_itineraries SET views = views + 1 WHERE id = ?`,
    [id]
  );
};

export const likeShared = async (id: number) => {
  return db.execute(
    `UPDATE shared_itineraries SET likes = likes + 1 WHERE id = ?`,
    [id]
  );
};
