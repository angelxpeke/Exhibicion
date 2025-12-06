const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    // create unique db name for user
    const dbName = `user_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const email = `${username}_${Math.random().toString(36).slice(2,8)}@local.test`;

    const user = new User({ username, password, dbName, email });
    await user.save();

    res.status(201).json({ msg: 'User created', userId: user._id });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, dbName: user.dbName }, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, dbName: user.dbName });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};
