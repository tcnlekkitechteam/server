const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.sendStatus(401);
    const rolesArray = [...allowedRoles];
    const hasRoles = req.roles.some((role) => rolesArray.includes(role));
    if (!hasRoles) return res.sendStatus(403);
    next();
  };
};

module.exports = verifyRoles;
