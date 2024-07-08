const getTokenFromHeader =(req) =>{
const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return null
return authHeader.split(" ")[1];

}
module.exports = {getTokenFromHeader}