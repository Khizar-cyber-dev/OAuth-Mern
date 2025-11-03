import express from 'express';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import authRoute from './Route/authRoute.js'
import './lib/passport.js';
import { connectDB } from './lib/db.js';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Required for passport
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api/auth", authRoute);

if(process.env.NODE_ENV === "production"){
  const clientDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(clientDistPath));
  console.log("Serving static files from:", clientDistPath);

 app.get("/*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.listen(3000, () => {
  connectDB();
  console.log("✅ Server running on port 3000");
});
