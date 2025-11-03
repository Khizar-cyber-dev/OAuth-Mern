import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redis from './redis.js';

dotenv.config();

export const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

export const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await redis.set(`refresh_token:${userId}`, refreshToken, {
      ex: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (err) {
    console.error("Redis store error:", err);
    throw err;
  }
};

export const verifyToken = (token, type) => {
    try {
        const secret = type === 'access' ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;  
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
}

export const removeRefreshToken = async (userId) => {
  try {
    await redis.del(`refresh_token:${userId}`);
    } catch (err) {
        console.error("Redis delete error:", err);
        throw err;
    }
};

export const getStoredRefreshToken = async (userId) => {
  try {
    return await redis.get(`refresh_token:${userId}`);  
    } catch (err) {
        console.error("Redis get error:", err);
        throw err;
    }
};

export const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}