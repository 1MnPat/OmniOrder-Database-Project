import { verifyToken, getTokenFromHeader } from './auth';
import { unauthorizedResponse, forbiddenResponse } from './response';

export function requireAuth(handler, allowedRoles = []) {
  return async (request, context) => {
    const token = getTokenFromHeader(request);
    if (!token) return unauthorizedResponse('No token provided');

    const decoded = verifyToken(token);
    if (!decoded) return unauthorizedResponse('Invalid or expired token');

    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return forbiddenResponse('Insufficient permissions');
    }

    request.user = decoded;
    return handler(request, context);
  };
}
