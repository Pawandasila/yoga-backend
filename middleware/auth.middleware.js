import User from "../models/user.Model.js";


export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
};

export const hasRole = (role) => {
    return async (req, res, next) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: "Authentication required" });
            }

            const user = await User.findById(req.session.userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (user.role !== role) {
                return res.status(403).json({ success: false, message: `Access denied. ${role} privilege required` });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const isOwner = (req, res, next) => {
    if (!req.session.userId || req.session.userId !== req.params.userId) {
        return res.status(403).json({ success: false, message: "Access denied. You can only access your own resources." });
    }
    next();
};

export const updateLastActivity = async (req, res, next) => {
    if (req.session.userId) {
        await User.findByIdAndUpdate(req.session.userId, { lastActivity: new Date() });
    }
    next();
};