import jwt from 'jsonwebtoken';
import User from '../modals/UserModal.js';
import asyncHandler from './asyncHandler.js';


const authenticate = asyncHandler(async (req, res, next) => {
    const userToken = req.headers.authorization;
    console.log('Authorization header:', userToken);  // Log the token
  
    if (!userToken) {
      res.status(401).json({ message: 'No token provided' });
      throw new Error('Not Authorized. Token failed');
    }
  
    const token = userToken.split('Bearer ')[1];
  
    if (!token) {
      res.status(401).json({ message: 'Token format is incorrect' });
      throw new Error('Not Authorized. No token');
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
  
      if (!user) {
        res.status(401).json({ message: 'User not found' });
        throw new Error('Not Authorized. User not found');
      }
  
      req.userId = user._id;
      req.userName = user.username;
      console.log(req.userId);
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Token verification failed' });
      throw new Error('Not Authorized. Token failed');
    }
  });
  
  export { authenticate };
  