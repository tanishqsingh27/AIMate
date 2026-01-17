import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAuthUrl, getTokensFromCode } from '../services/gmailService.js';

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+gmailRefreshToken');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        gmailConnected: !!user.gmailRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/gmail/url
 * @desc    Get Gmail OAuth URL
 * @access  Private
 */
export const getGmailAuthUrl = async (req, res, next) => {
  try {
    const authUrl = getAuthUrl();
    res.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/gmail/callback
 * @desc    Handle Gmail OAuth callback
 * @access  Private
 */
export const handleGmailCallback = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      });
    }

    const tokens = await getTokensFromCode(code);

    // Update user with Gmail tokens
    const user = await User.findById(req.user.id);
    user.gmailAccessToken = tokens.access_token;
    user.gmailRefreshToken = tokens.refresh_token;
    await user.save();

    res.json({
      success: true,
      message: 'Gmail connected successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/gmail/disconnect
 * @desc    Disconnect Gmail account
 * @access  Private
 */
export const disconnectGmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.gmailAccessToken = undefined;
    user.gmailRefreshToken = undefined;
    user.gmailEmail = undefined;
    await user.save();

    // Delete all emails from this user when disconnecting
    const Email = (await import('../models/Email.js')).default;
    await Email.deleteMany({ user: req.user.id });

    res.json({
      success: true,
      message: 'Gmail disconnected successfully',
    });
  } catch (error) {
    next(error);
  }
};

