// src/controllers/userController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const searchUsername = new RegExp(req.query.username, 'i');
    const searchDomain = new RegExp(req.query.domain, 'i');

    let startDate, endDate;

    if (req.query.from && req.query.to) {
      startDate = new Date(req.query.from);
      endDate = new Date(req.query.to);
      // Set start time to 00:00:00:000
      startDate.setHours(0, 0, 0, 0);
      // Set end time to 23:59:59:999
      endDate.setHours(23, 59, 59, 999);
    } else if (req.query.from) {
      startDate = new Date(req.query.from);
      // Set start time to 00:00:00:000
      startDate.setHours(0, 0, 0, 0);
      // End date is not defined, you may choose to set it to current time or some default end time
      endDate = new Date(); // Set end time to current time
    } else if (req.query.to) {
      // Start date is not defined, you may choose to set it to some default start time
      startDate = new Date(0); // Set start time to Unix epoch (1970-01-01T00:00:00.000Z)
      endDate = new Date(req.query.to);
      // Set end time to 23:59:59:999
      endDate.setHours(23, 59, 59, 999);
    }

    const query = { role: 'user' };

    if (searchUsername && searchDomain && startDate && endDate) {
      query.$and = [
        { username: { $regex: searchUsername } },
        { domain: { $regex: searchDomain } },
        { created_at: { $gte: startDate, $lte: endDate } }
      ];
    } else {
      if (searchUsername) {
        query.username = { $regex: searchUsername };
      }

      if (searchDomain) {
        query.domain = { $regex: searchDomain };
      }

      // Adjust condition to check for startDate and endDate
      if (startDate && endDate) {
        query.created_at = { $gte: startDate, $lte: endDate };
      }
    }

    const users = await User.find(query)
      .skip(startIndex)
      .limit(limit);

    res.json({
      page,
      limit,
      totalUsers: await User.countDocuments(query),
      users
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(400).json({
        status: 'Error',
        message: 'Username already exists.'
      });
    }

    const user = new User(req.body);
    user.created_by = req.user._id;

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    await user.save();
    res.status(201).json({
      status: 'Success',
      message: 'User was created.',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubUserById = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const subusers = await User.find({
      created_by: req.params.id,
      role: 'subuser'
    })
      .skip(startIndex)
      .limit(limit);

    res.json({
      page,
      limit,
      totalSubUsers: await User.countDocuments({ role: 'subuser', created_by: req.params.id }),
      subusers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['domain', 'name'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    user.tokens = [];
    const token = user.generateAuthToken();

    res.header('Authorization', `Bearer ${token}`).json({
      status: 'Success',
      message: 'Login Success.',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        type: user.type,
        tokens: user.tokens,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // Assuming req.user and req.token are attached through middleware
    req.user.tokens = req.user.tokens.filter((tokenObj) => tokenObj.token !== req.token);

    // Save the user with the updated tokens array
    await req.user.save();
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password was wrong' });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ message: 'Password was used' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(401).json({ message: 'Confirm new password was incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password was updated' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const newPassword = Math.random().toString(36).slice(-6);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(user_id, { password: hashedPassword }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ newPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 