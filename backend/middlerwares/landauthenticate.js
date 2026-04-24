import jwt from 'jsonwebtoken';
import User from '../modals/UserModal.js';
import asyncHandler from './asyncHandler.js';

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // Debug log

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1].trim(); // Get token after 'Bearer'

  if (!token) {
    return res.status(401).json({ message: 'Token missing after Bearer' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach full user object or minimal info to req.user
    req.user = { id: user._id.toString(), username: user.username, role: user.role };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Token verification failed' });
  }
});

export { authenticate };
