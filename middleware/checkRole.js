function checkRole(roles) {
    return function(req, res, next) {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ error: 'Unauthorized.' });
        }
    };
}

module.exports = { checkRole };