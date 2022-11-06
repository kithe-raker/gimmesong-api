const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const router = require("./api");

const app = express();
const PORT = process.env.PORT || 8080;

const _whitelist = [
  "http://localhost:3000",
  "https://gimmesong.link",
  "https://www.gimmesong.link",
];
const _corsOptions = {
  origin: function (origin, callback) {
    if (_whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

console.log("NODE_ENV=", process.env.NODE_ENV);

app.use(cors(_corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(router);
app.set("trust proxy", true);

app.get("/", (req, res, next) => {
  res.send(`OK`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
