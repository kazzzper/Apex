const pool = require('../db/db.js');

const createUser = async ({ fullname, email, password, plan }) => {
  const result = await pool.query(
    `INSERT INTO "users" (fullname, email, password, plan, joined, balance)
     VALUES ($1, $2, $3, $4, NOW(), 0)
     RETURNING *`,
    [fullname, email, password, plan]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM "users" WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const updateUserPlan = async (email, plan) => {
  const result = await pool.query(
    'UPDATE "users" SET plan = $1 WHERE email = $2 RETURNING *',
    [plan, email]
  );
  return result.rows[0];
};

const updateUserInfo = async (email, fullname) => {
  const result = await pool.query(
    'UPDATE "users" SET fullname = $1 WHERE email = $2 RETURNING *',
    [fullname, email]
  );
  return result.rows[0];
};

const updateUserPassword = async (email, newPassword) => {
  const result = await pool.query(
    'UPDATE "users" SET password = $1 WHERE email = $2 RETURNING *',
    [newPassword, email]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  updateUserPlan,
  updateUserInfo,
  updateUserPassword,
};
