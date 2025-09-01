import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || crypto.randomBytes(64).toString('hex');
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || crypto.randomBytes(64).toString('hex');
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRY || '7d';

const parseDurationToMilliseconds = (duration) => {
  const value = parseInt(duration);
  const unit = duration.slice(-1).toLowerCase(); // 'd', 'h', 'm', 's'

  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60 * 1000; // days to milliseconds
    case 'h':
      return value * 60 * 60 * 1000; // hours to milliseconds
    case 'm':
      return value * 60 * 1000; // minutes to milliseconds
    case 's':
      return value * 1000; // seconds to milliseconds

    default: return parseInt(duration) || 0; // fallback to milliseconds if no unit is provided
  }
}

export const generateAccessToken = (userId,role,username) => {
    const accessToken = jwt.sign(
        {
            id: userId,
            role: role,
            username: username
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    );
    return {accessToken,accessTokenExpiresIn: Date.now() + parseDurationToMilliseconds(ACCESS_TOKEN_EXPIRES_IN)};
};

export const generateRefreshToken = (userId) => {
    const refreshToken =  jwt.sign(
        {id: userId},
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        }
    );
    return {refreshToken: refreshToken, refreshTokenExpiresIn: Date.now() + parseDurationToMilliseconds(REFRESH_TOKEN_EXPIRES_IN)};
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

export const generateTokens = (user) => {
  const {accessToken, accessTokenExpiresIn} = generateAccessToken(user._id, user.role, user.username);
  const {refreshToken, refreshTokenExpiresIn} = generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn,
    refreshTokenExpiresIn
  };
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    extractTokenFromHeader,
    generateTokens
};