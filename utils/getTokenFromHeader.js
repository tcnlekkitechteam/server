const getTokenFromHeader =(req) =>{
const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return null
return authHeader.split(" ")[1];

}
module.exports = {getTokenFromHeader}


// const getTokenFromHeader = (req) => {
//     const header = req.headers.authorization;
//     if (header && header.startsWith('Bearer ')) {
//       return header.split(' ')[1];
//     }
//     return null;
//   };
  
//   module.exports = getTokenFromHeader;
  