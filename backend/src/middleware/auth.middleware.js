const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blood_bank_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user || (roles.length > 0 && !roles.includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges'
      });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  requireRole
};
