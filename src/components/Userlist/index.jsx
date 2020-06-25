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

  loadUserListFromServer = async () => {
    const { cookies } = this.props;
    const accessToken = cookies.get("token");
    try {
      const userlistPromise = await axios.get(
        "http://localhost:5000/user/list",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      userlistPromise.then((response) => {
        this.setState({ users: response.data });
      });
    } catch (error) {
      const refreshToken = cookies.get("refresh");
      axios
        .post("http://localhost:5000/auth/refresh", { refresh: refreshToken })
        .then((response) => {
          cookies.set("token", response.data.token);
          cookies.set("refresh", response.data.refresh);
          axios
            .get("http://localhost:5000/user/list", {
              headers: { Authorization: `Bearer ${response.data.token}` },
            })
            .then((response) => {
              this.setState({ users: response.data });
            });
        });
    }
  };

  componentDidMount() {
    this.loadUserListFromServer();
  }

  render() {
    let userList = this.state.users ? (
      this.state.users.map((user, index) => {
        return (
          <li
            key={index}
            className="badge badge-secondary col-sm-12 col-md-3 mb-2"
          >
            {user.email}
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
