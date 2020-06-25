import React from "react";
import "./Login.css";
import axios from "axios";
import { withCookies, Cookies } from "react-cookie";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
    this.inputUsernameChange = this.inputUsernameChange.bind(this);
    this.inputPasswordChange = this.inputPasswordChange.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
  }

  inputUsernameChange = (event) => {
    this.setState({
      username: event.target.value,
    });
  };

  inputPasswordChange = (event) => {
    this.setState({
      password: event.target.value,
    });
  };

  submitLogin = (event) => {
    event.preventDefault();

    if (this.state.username === "" || this.state.password === "") {
      return;
    }

    const userInfo = {
      username: this.state.username,
      password: this.state.password,
    };

    const { cookies } = this.props;
    axios.post("http://localhost:5000/login", { userInfo }).then((response) => {
      if (response.data === "error") {
        return;
      }
      this.setState({
        username: "",
        password: "",
      });
      cookies.set("JWT_ACCESS_TOKEN", response.data.accessToken);
      cookies.set("JWT_REFRESH_TOKEN", response.data.refreshToken);
      window.location = "/users";
    });
  };

  refreshTokens = () => {
    const { cookies } = this.props;
    const refreshToken = cookies.get("JWT_REFRESH_TOKEN");
    axios
      .get("http://localhost:5000/refresh", {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((response) => {
        if (response.data.refreshTokenVerifyStatus === "valid") {
          cookies.set("JWT_ACCESS_TOKEN", response.data.tokens.accessToken);
          cookies.set("JWT_REFRESH_TOKEN", response.data.tokens.refreshToken);
          window.location = "/users";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  async getAccessTokenVerifyStatus() {
    const { cookies } = this.props;
    const accessToken = cookies.get("JWT_ACCESS_TOKEN");
    if (accessToken) {
      try {
        const response = await axios.get("http://localhost:5000/verify", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data.accessTokenVerifyStatus;
      } catch (error) {
        return "error";
      }
    } else {
      return "error";
    }
  }

  componentWillMount() {
    const accessTokenVerifyStatus = this.getAccessTokenVerifyStatus();
    accessTokenVerifyStatus.then((status) => {
      if (status === "valid") {
        window.location = "/users";
      }
      if (status === "error") {
        this.refreshTokens();
      }
    });
  }

  render() {
    return (
      <div className="login">
        <h2 className="login__title">Sign in to continue</h2>
        <form className="login__form" onSubmit={this.submitLogin}>
          <div className="form-row d-flex flex-column align-items-center">
            <div className="col-sm-12 col-md-4 input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">
                  Username
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
                value={this.state.username}
                onChange={this.inputUsernameChange}
              />
            </div>
            <div className="col-sm-12 col-md-4 input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">
                  Password
                </span>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                aria-label="Password"
                aria-describedby="basic-addon1"
                value={this.state.password}
                onChange={this.inputPasswordChange}
              />
            </div>
            <button
              type="submit"
              className="col-sm-12 col-md-4 btn btn-primary"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default withCookies(Login);
