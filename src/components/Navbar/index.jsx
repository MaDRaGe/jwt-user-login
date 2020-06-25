import React from "react";
import { Link } from "react-router-dom";

export default (props) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-3 row">
      <ul className="navbar-nav d-flex">
        <li className="nav-item">
          <Link to="/">
            <span className="nav-link">Login</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};
