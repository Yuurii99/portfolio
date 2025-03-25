const User = require("../models/user");

module.exports.renderRegisterForm =  (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({email, username});
        const registerdUser = await User.register(user, password);
        req.login(registerdUser, (err) => {
            if (err) { return next(err) };

            req.flash("success", "Yelp Campへようこそ！");
            res.redirect("/campgrounds");
        });
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
};

module.exports.renderLoginForm =  (req, res) => {
    res.render("users/login")
};

module.exports.login = (req, res) => {
    req.flash("success", "おかえりなさい！！");
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }

        req.flash("success", "ログアウトしました");
        res.redirect("/campgrounds");
    });
};