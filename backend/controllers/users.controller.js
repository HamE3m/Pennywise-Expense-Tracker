import User from '../models/users.model.js';
import bcrypt from 'bcryptjs';

export const getUser = async (req, res) => {
  // fetching user data using userID
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ 
      success: true, 
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Checking for existing users
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hashing password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creating a new user
    const user = await User.create({name, email, password: hashedPassword});

    if (user) {
      res.status(201).json({success: true, message: 'User created successfully', user: {id: user.id, name: user.name, email: user.email}});
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Checking emails among existing users
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Password verification
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({success: true, user: {id: user.id, name: user.name, email: user.email, balance: user.balance}});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password for verifying user
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    // Updating user info
    user.name = name || user.name;
    user.email = email || user.email;

    // Updating password if new password is given by user
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({success: true, user: {id: user.id, name: user.name, email: user.email}});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const addIncome = async (req, res) => {
  try {
    const { amount, type } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Adding income to balance/ deducting expense from balance
    const modifier = type === 'income' ? 1 : -1;
    const newBalance = (user.balance || 0) + (Number(amount) * modifier);

    // Negative balance checking for expenses
    if (type === 'expense' && newBalance < 0) {
      return res.status(400).json({success: false, message: 'Insufficient balance for this expense'})}

    user.balance = newBalance;
    await user.save();

    res.status(200).json({success: true, balance: user.balance});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}