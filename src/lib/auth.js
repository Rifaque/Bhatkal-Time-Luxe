import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bhatkaltimeluxe';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and verifies the token from the Request headers or cookies.
 * Works inside API Route Handlers.
 */
export function getAdminFromRequest(req) {
  // Try to get token from Authorization header first
  const authHeader = req.headers.get('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Fallback to cookies
  if (!token) {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/adminToken=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) return null;
  return verifyToken(token);
}
