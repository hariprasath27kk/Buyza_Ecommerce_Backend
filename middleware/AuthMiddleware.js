const jwt = require('jsonwebtoken');
function verifyToken(req,res,next){
    const authHeader = req.header('Authorization');
// console.log('-------------in',authHeader)

    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    // console.log("token ====",token);  
    if(!token)
        return res.status(401).json({error: 'Access denied'});
    try{
        const decoded = jwt.verify(token, 'this-can-be-any-random-key');
        req.userId = decoded.userId;
        // console.log("req.userId",req.userId);
         next();

    }catch(error){
        console.log(error)
        res.status(401).json({error : 'Invalid token'})
    }
};

module.exports = verifyToken;