// const verifyRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req?.body?.roles) return res.sendStatus(401);
//     const rolesArray = [...allowedRoles];
//     const result = req.body.roles
//       .map((role) => rolesArray.includes(role))
//       .find((val) => val === true);
//     if (!result) return res.sendStatus(401);
//     next();
//   };
// };

// module.exports = verifyRoles;


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
