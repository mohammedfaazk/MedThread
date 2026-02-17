"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const errors_1 = require("../utils/errors");
const requireAdmin = (req, res, next) => {
    if (!req.userRole || req.userRole !== 'ADMIN') {
        return next(new errors_1.ForbiddenError('Admin access required'));
    }
    next();
};
exports.requireAdmin = requireAdmin;
