const jwt = require('jsonwebtoken');

function getToken(req){
  const h = req.headers['authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (m) return m[1];
  // Fallback to cookie-based access token
  if (req.cookies && req.cookies.accessToken) return req.cookies.accessToken;
  if (req.cookies && req.cookies.token) return req.cookies.token; // legacy
  return null;
}

function requireAuth(req, res, next){
  try{
    const token = getToken(req);
    if(!token) return res.status(401).json({ error: 'Unauthorized' });
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = jwt.verify(token, secret);
    req.user = payload; // { id, email, role, name }
    next();
  }catch(err){
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function requireRole(...roles){
  return (req, res, next) => {
    if(!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if(roles.length === 0) return next();
    if(roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

// Backwards compatibility: default export behaves like admin-only middleware
function requireAdminCompat(req, res, next){
  return requireAuth(req, res, (err)=>{
    if(err) return next(err);
    return requireRole('admin')(req, res, next);
  });
}

module.exports = requireAdminCompat;
module.exports.requireAuth = requireAuth;
module.exports.requireRole = requireRole;
