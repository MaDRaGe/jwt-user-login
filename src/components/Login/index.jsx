import React from "react";
import "./Login.css";
import axios from "axios";
import { withCookies, Cookies } from "react-cookie";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
    this.inputEmailChange = this.inputEmailChange.bind(this);
    this.inputPasswordChange = this.inputPasswordChange.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
  }

  inputEmailChange = (event) => {
    this.setState({
      email: event.target.value,
    });
  };

  inputPasswordChange = (event) => {
    this.setState({
      password: event.target.value,
    });
  };

  submitLogin = (event) => {
    event.preventDefault();

    if (this.state.email === "" || this.state.password === "") {
      return;
    }

    const userInfo = {
      email: this.state.email,
      password: this.state.password,
    };

    const { cookies } = this.props;
    axios
      .post("http://localhost:5000/auth/signin", { userInfo })
      .then((response) => {
        this.setState({
          email: "",
          password: "",
        });
        cookies.set("token", response.data.token);
        cookies.set("refresh", response.data.refresh);
        window.location = "/user/list";
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    return (
      <div className="login">
        <h2 className="login__title">Sign in to continue</h2>
        <form className="login__form" onSubmit={this.submitLogin}>
          <div className="form-row d-flex flex-column align-items-center">
            <div className="col-sm-12 col-md-4 input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon1">
                  Email
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Email"
                aria-label="Email"
                aria-describedby="basic-addon1"
                value={this.state.email}
                onChange={this.inputEmailChange}
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
