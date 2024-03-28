// const { doubleCsrf } = require("csrf-csrf");

const csurf = require("csurf");
export const csrfProtectionMiddleware = csurf({ cookie: { httpOnly: true } });

// const {
//   generateToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
//   doubleCsrfProtection, // This is the default CSRF protection middleware.
// } = doubleCsrf({});

// export function csrfProtectionMiddleware(req, res, next) {}
