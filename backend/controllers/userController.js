const bcrypt = require('bcryptjs');
const {
  createUser,
  findUserByEmail,
  updateUserPlan,
  updateUserInfo,
  updateUserPassword
} = require('../models/userModel');

exports.register = async (req, res) => {
  const { fullname, email, password } = req.body;
  const userExists = await findUserByEmail(email);

  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ fullname, email, password: hashed, plan: 'free' });

  res.json(user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

  res.json(user); // In production: issue JWT token here
};

exports.updatePlan = async (req, res) => {
  const { email, plan } = req.body;
  const user = await updateUserPlan(email, plan);
  res.json(user);
};

exports.updateInfo = async (req, res) => {
  const { email, fullname } = req.body;
  const user = await updateUserInfo(email, fullname);
  res.json(user);
};

exports.updatePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const user = await findUserByEmail(email);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(400).json({ message: 'Incorrect current password' });

  const hashed = await bcrypt.hash(newPassword, 10);
  const updated = await updateUserPassword(email, hashed);
  res.json({ message: 'Password updated', user: updated });
};
