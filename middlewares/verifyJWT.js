const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  // console.log(token);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); //invalid token
    req.user = decoded.userId;
    req.email = decoded.email;
    const roles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
    req.roles = roles.map(role =>Number(role))
    next();
  });
};

module.exports = verifyJWT;
