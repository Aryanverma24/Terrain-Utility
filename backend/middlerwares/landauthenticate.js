import jwt from 'jsonwebtoken';
import User from '../modals/UserModal.js';
import asyncHandler from './asyncHandler.js';

const authenticate = asyncHandler(async (req, res, next) => {
  const userToken = req.headers.authorization;
  console.log('Authorization header:', userToken); // Debugging token presence

  if (!userToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = userToken.startsWith('Bearer ') ? userToken.split('Bearer ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Token format is incorrect' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);  // Debug the decoded token

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user._id, username: user.username }; // Attach user data
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);  // Debugging token error
    return res.status(401).json({ message: 'Token verification failed' });
  }
});

export { authenticate };