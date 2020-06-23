import React from "react";
import axios from "axios";
import { withCookies } from "react-cookie";

class Userlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
    };
  }

  refreshTokens = () => {
    const { cookies } = this.props;
    const refreshToken = cookies.get("JWT_REFRESH_TOKEN");
    axios
      .get("http://localhost:5000/refresh", {
        headers: { Authorization: `Bearer ${refreshToken}` },
      })
      .then((response) => {
        console.log(response);
        if (response.data.refreshTokenVerifyStatus === "valid") {
          cookies.set("JWT_ACCESS_TOKEN", response.data.tokens.accessToken);
          cookies.set("JWT_REFRESH_TOKEN", response.data.tokens.refreshToken);
          const accessToken = cookies.get("JWT_ACCESS_TOKEN");
          axios
            .get("http://localhost:5000/users", {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
            .then((response) => {
              console.log(response);
              this.setState({
                users: response.data.users,
              });
            })
            .catch((error) => {
              console.log(error);
            });
        }
        if (response.data.refreshTokenVerifyStatus === "error") {
          window.location = "/";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  getUserListFromServer = () => {
    const { cookies } = this.props;
    const accessToken = cookies.get("JWT_ACCESS_TOKEN");
    axios
      .get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((response) => {
        console.log(response);
        if (response.data.accessTokenVerifyStatus === "error") {
          this.refreshTokens();
        } else {
          this.setState({
            users: response.data.users,
          });
        }
      });
  };

  componentDidMount() {
    this.getUserListFromServer();
  }

  render() {
    let userList = this.state.users ? (
      this.state.users.map((user, index) => {
        return (
          <li
            key={index}
            className="badge badge-secondary col-sm-12 col-md-3 mb-2"
          >
            {user.username}
          </li>
        );
      })
    ) : (
      <p>userlist is empty</p>
    );
    return (
      <div>
        <h2>User list</h2>
        <ul className="userlist d-flex flex-column row">{userList}</ul>
      </div>
    );
  }
}

export default withCookies(Userlist);
