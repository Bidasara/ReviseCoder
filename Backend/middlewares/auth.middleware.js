import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwtUtils.js";
import {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticateJWT = asyncHandler( async (req, res, next) => {
    // Get auth header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    if (!token) 
      throw new Error(401, 'Access denied. No token provided.');
    
    // Verify token
    let decoded = null;
    try{
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired access token.' 
      });
    }
    
    // Check if user still exists in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'The user belonging to this token no longer exists.' 
      });
    }

    // Add user info to request object
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
});

export const requireRole = (...roles) => {
  return (req, res, next) => {
    // Check if user object exists (should be added by authenticateJWT)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized access.' 
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: you do not have permission to access this resource.' 
      });
    }

    next();
  };
};

export default {
  authenticateJWT,
  requireRole,
};