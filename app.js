if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// const cookieParser = require("cookie-parser");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");


// 本番用
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbUrl = `mongodb+srv://${ dbUser }:${ dbPass }@cluster0.v9pvd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// 開発用
// const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp";

mongoose.connect(dbUrl)
    .then(() => {
        console.log("MongoDBコネクションOK");
    })
    .catch(err => {
        console.log("MongoDBコネクションエラー");
        console.log(err);
    });

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // 明示的にtrue
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1週間の有効期限をミリ秒で表現
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    
    next();
});

app.get("/", (req, res) => {
    res.render("home");
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.all("*", (req, res, next) => {
    next(new ExpressError("ページが見つかりませんでした", 404));
});

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) {
        err.massage = "問題が起きました";
    };
    res.status(statusCode).render("error", {err});
});

app.listen(3000, () => {
    console.log("ポート3000で待ち受け中");
});