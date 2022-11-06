const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const proxy = require("express-http-proxy");

require("dotenv").config();

const router = require("./api");

const app = express();
const PORT = process.env.PORT || 8080;

const _whitelist = [
  "http://localhost:3000",
  "https://gimmesong.link",
  "https://www.gimmesong.link",
  "https://gimmesong-nextjs.vercel.app",
  "https://www.gimmesong-nextjs.vercel.app",
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

app.use(
  "/api/v1/songstreams",
  proxy("beatbump.ml", {
    proxyReqPathResolver: function (req, res) {
      const id = req.query?.id ?? "";
      return `/api/v1/player.json?videoId=${id}`;
    },
  })
);

app.get("/", (req, res, next) => {
  res.send(`OK`);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
