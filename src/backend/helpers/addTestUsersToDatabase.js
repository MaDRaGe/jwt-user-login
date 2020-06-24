const User = require("../models/user.model");
const mongoose = require("mongoose");

addTestUsersToDatabase = (connectionOptions) => {
  mongoose
    .connect(connectionOptions.uri, connectionOptions.options)
    .then((result) => {
      for (let i = 0; i < 5; i++) {
        User.deleteOne({ username: `admin${i}` }, (error, result) => {
          let newUser = new User({ username: `admin${i}`, password: "1111" });
          newUser.save();
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = addTestUsersToDatabase;
