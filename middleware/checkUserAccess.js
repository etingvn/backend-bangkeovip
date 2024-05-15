function checkUserAccess() {
    return function(req, res, next) {
        try {
        if (!req.user) {
            throw new Error('Unauthorized');
        }

        if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
            next();
        } else {
            throw new Error('Unauthorized');
        }
        } catch (error) {
        res.status(403).json({ error: error.message });
        }
    };
}

module.exports = { checkUserAccess };
  