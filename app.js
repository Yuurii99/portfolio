if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");


const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const cookieParser = require("cookie-parser");

const dbUrl =  process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

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
app.use(mongoSanitize());

const secret = process.env.SECRET || "mysecret";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  // 24時間ごとにセッションを更新
    crypto: {
        secret
    },
});

store.on("error", err => {
    console.log("セッションストアエラー", err);
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // 明示的にtrue
        // secure: true, // http"s"
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1週間の有効期限をミリ秒で表現
    }
};

sessionConfig.cookie.secure = process.env.NODE_ENV !== "production" ? false : true;

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(helmet());
app.use(cookieParser());

const scriptSrcUrls = [
    'https://cdn.jsdelivr.net',
    "https://cdn.maptiler.com",
];
const styleSrcUrls = [
    'https://cdn.jsdelivr.net',
    "https://cdn.maptiler.com",
    "https://fonts.googleapis.com",
];
const connectSrcUrls = [
    "https://api.maptiler.com",
    "https://cdn.maptiler.com",
    "https://cdn.jsdelivr.net",
];
const fontSrcUrls = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com',
    "https://api.maptiler.com"
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));

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