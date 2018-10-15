"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
exports.requireLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
    }
    else {
        next();
    }
};
exports.getMainPage = (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/personal.html'));
    //res.render('personal');
};
exports.stopSession = (req, res) => {
    req.session.destroy(function (err) {
        if (err)
            throw err;
        res.redirect("/");
    });
};

exports.getLoginPage = (req, res) => {
    res.render('signIn');
    // res.sendFile(path_1.default.join(__dirname, '../public/login/signIn.html'));
};
//# sourceMappingURL=user.js.map