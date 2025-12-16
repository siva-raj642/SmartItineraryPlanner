import { db } from '../config/db';

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `;
  return db.execute(sql, [name, email, password, role]);
};

export const findUserByEmail = async (email: string) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  const [rows] = await db.execute(sql, [email]);
  return rows;
};

export const getAllUsers = async () => {
  const [rows] = await db.execute(`SELECT id, name, email, role FROM users`);
  return rows;
};
