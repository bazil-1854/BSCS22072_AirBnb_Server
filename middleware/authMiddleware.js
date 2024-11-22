const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        //console.log(req.user)
        //console.log(req.user.id)
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
