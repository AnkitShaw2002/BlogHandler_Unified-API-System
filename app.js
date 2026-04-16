require('dotenv').config();
const express = require("express");
const dotenv = require("dotenv");

const path = require("path");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const MongoStore = require('connect-mongo');

const DbConnection = require('./app/config/db');

const app = express();

DbConnection();


// view engine and view folder set-up
app.set('view engine', 'ejs');
app.set('views', 'view');




// Session middleware (must come before routes)
// ── COOKIES & SESSION ───────────────────────────────────
app.use(cookieParser());
app.use(session({
  secret:            process.env.SESSION_SECRET || 'dhx_session_secret',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   7 * 24 * 60 * 60 * 1000
  }
}));

// app.use(cors({
//     origin: process.env.CLIENT_URL || '*',
//     credentials: true
// }));

app.use(cors());
app.use(cookieParser());



//public folder set-up
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
app.use("/api/auth", require("./app/routes/authRoutes"));
app.use("/api/user", require("./app/routes/userRoutes"));
app.use("/api/category", require("./app/routes/categoryRoutes"));
app.use("/api/blog", require("./app/routes/blogRoutes"));
app.use("/api/comment", require("./app/routes/commentRoutes"));



const port = process.env.PORT || 5000;
app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
});
