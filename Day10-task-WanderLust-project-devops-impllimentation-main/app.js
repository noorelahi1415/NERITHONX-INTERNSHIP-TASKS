if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const app = express();
app.set("trust proxy", 1);

const dbUrl = process.env.ATLASDB_URL;
const PORT = process.env.PORT || 8080;

/*
 * Trust one reverse proxy.
 * This will be required when Nginx is added.
 */
app.set("trust proxy", 1);

/*
 * View engine configuration
 */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

/*
 * Application middleware
 */
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/*
 * Health endpoint
 *
 * Docker will use this endpoint to check whether
 * the application and MongoDB connection are healthy.
 */
app.get("/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;

    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? "healthy" : "unhealthy",
        service: "wanderlust",
        database: databaseConnected ? "connected" : "disconnected",
    });
});

/*
 * Redirect the home page to the listings page.
 */
app.get("/", (req, res) => {
    return res.redirect("/listings");
});

/*
 * MongoDB session store
 */
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("ERROR in MONGO SESSION STORE:", err);
});

/*
 * Session configuration
 */
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",

        /*
         * During the first Docker test, NODE_ENV will
         * be development, so this will be false.
         *
         * Later, behind Nginx HTTPS, NODE_ENV will be
         * production, so this will become true.
         */
        secure: process.env.NODE_ENV === "production",
    },
};

app.use(session(sessionOptions));
app.use(flash());

/*
 * Passport authentication
 */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*
 * Variables available in EJS templates
 */
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

/*
 * Application routes
 */
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

/*
 * 404 handler
 */
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

/*
 * Global error handler
 */
app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong!",
    } = err;

    console.error(err);

    res.status(statusCode).render("error.ejs", {
        message,
    });
});

/*
 * Connect to MongoDB first.
 * Start the Express server only after MongoDB connects.
 */
async function startServer() {
    try {
        if (!dbUrl) {
            throw new Error(
                "ATLASDB_URL is missing. Add it to the .env file."
            );
        }

        if (!process.env.SECRET) {
            throw new Error(
                "SECRET is missing. Add it to the .env file."
            );
        }

        await mongoose.connect(dbUrl);

        console.log("Connected to MongoDB");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`WanderLust is listening on port ${PORT}`);
        });
    } catch (err) {
        console.error("Application startup failed:", err.message);
        process.exit(1);
    }
}

startServer();