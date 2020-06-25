const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const Token = require("./models/token.model");
const { create } = require("./models/user.model");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to database
const connectionOptions = {
  uri: process.env.MONGODB_URI,
  options: {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  },
};

const DatabaseManager = require("./helpers/DatabaseManager");
const db = new DatabaseManager();

mongoose.connection.on("open", () => {
  console.log("open connection");
});
mongoose.connection.on("close", () => {
  console.log("close connection");
});
mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});

checkToken = (token, secret) => {
  let status = null;
  jwt.verify(token, secret, (error, userId) => {
    if (error) {
      console.log(error);
      status = "error";
    } else {
      status = "valid";
    }
  });
  return status;
};

// Create access token and refresh token
createTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s" }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "365d" }
  );
  return { accessToken, refreshToken };
};

// Save tokens in database
saveTokensInDatabase = (userId, tokens) => {
  Token.deleteOne({ userId: userId })
    .then((result) => {
      console.log("Tokens deleted: \n" + result);
    })
    .catch((error) => {
      console.log("Error delete tokens: \n" + error);
    });
  const newToken = new Token({
    userId: userId,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
  newToken
    .save()
    .then((result) => {
      console.log("Tokens added: \n" + result);
    })
    .catch((error) => {
      console.log("Error add tokens: \n" + error);
    });
};

// Login user
app.post("/login", (request, response) => {
  User.findOne({
    username: request.body.userInfo.username,
  })
    .then((user) => {
      if (user.password === request.body.userInfo.password) {
        tokens = createTokens(user.id);
        saveTokensInDatabase(user.id, tokens);
        response.json(tokens);
      } else {
        response.json("error");
      }
    })
    .catch((error) => {
      console.log(error);
      response.json("error");
    });
});

// Get userlist from database
app.get("/users", (request, response) => {
  let accessTokenVerifyStatus = checkToken(
    request.headers["authorization"].split(" ")[1],
    process.env.ACCESS_TOKEN_SECRET
  );
  if (accessTokenVerifyStatus === "valid") {
    User.find()
      .then((users) => {
        response.json({
          accessTokenVerifyStatus: accessTokenVerifyStatus,
          users: users,
        });
      })
      .catch((error) => {
        response.status(400).json("Error: " + error);
      });
  } else {
    response.json({ accessTokenVerifyStatus: accessTokenVerifyStatus });
  }
});

// Verify access token
app.get("/verify", (request, response) => {
  const accessTokenVerifyStatus = checkToken(
    request.headers["authorization"].split(" ")[1],
    process.env.ACCESS_TOKEN_SECRET
  );
  response.json({ accessTokenVerifyStatus: accessTokenVerifyStatus });
});

// Refresh tokens
app.get("/refresh", (request, response) => {
  console.log("Need refresh? I'm here!");
  const refreshToken = request.headers["authorization"].split(" ")[1];
  const refreshTokenVerifyStatus = checkToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (refreshTokenVerifyStatus === "valid") {
    const refreshTokenValue = jwt.decode(refreshToken);
    const newTokens = createTokens(refreshTokenValue.id);
    saveTokensInDatabase(refreshTokenValue.id, newTokens);
    response.json({
      refreshTokenVerifyStatus: refreshTokenVerifyStatus,
      tokens: newTokens,
    });
  }
  if (refreshTokenVerifyStatus === "error") {
    response.json({ refreshTokenVerifyStatus: refreshTokenVerifyStatus });
  }
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});

const addTestUsersToDatabase = require("./helpers/addTestUsersToDatabase");
addTestUsersToDatabase(connectionOptions);
