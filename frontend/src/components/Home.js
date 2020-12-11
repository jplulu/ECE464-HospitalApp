import React, { Component } from "react";
import loggedIn from "./loggedIn";
import Login from "./Login";
import Nav from "./Nav";

class Home extends Component {
	componentDidMount() {
		if (loggedIn()) {
			const user_type = JSON.parse(localStorage.getItem("user")).user_type;
			if (user_type === "ADMIN") {
				this.props.history.push("/admin");
			} else if (user_type === "PATIENT") {
				this.props.history.push("/patient");
			} else {
				this.props.history.push("/doctor");
			}
		}
	}

	render() {
		return (
			<div style={{ textAlign: "center" }}>
				<h1>Welcome</h1>
				<Login></Login>
			</div>
		);
	}
}

export default Home;
