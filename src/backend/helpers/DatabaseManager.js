const mongoose = require("mongoose");
const User = require("../models/user.model");

class DatabaseManager {
  static instance = null;
  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }
    this.some = true;
    this.connectionOptions = null;
    Object.freeze(this);
    DatabaseManager.instance = this;
  }

  /*
    Connect to database with the following options

    @params:
      connectionOptions - options which should be used for connection setup
  */
  connect = (connectionOptions) => {
    // TODO:
  };

  /*
    Disconnect from the database
  */
  disconnect = () => {
    mongoose.disconnect();
  };

  /*
    Set connection options
  */
  setConnectionOptions = (connectionOptions) => {
    //this.connectionOptions = connectionOptions;
  };
}

module.exports = DatabaseManager;
