import React, { Component } from "react";
import Nav from "./Nav";
import loggedIn from "./loggedIn";

class Admin extends Component {
	componentDidMount() {
		if (!loggedIn()) {
			this.props.history.push("/");
		}
	}

	render() {
		return <div></div>;
	}
}

export default Admin;
