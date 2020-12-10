import React, { Component } from "react";
import axios from "axios";
import Nav from "./Nav";
import loggedIn from "./loggedIn";

class Doctor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			info: {},
			appointments: [],
			prescriptions: [],
		};
	}

	componentDidMount() {
		if (loggedIn()) {
			const username = JSON.parse(localStorage.getItem("user")).username;
			axios
				.get("http://localhost:5000/user", null, {
					params: {
						username: username,
					},
				})
				.then((response) => {
					this.setState({
						info: response.data,
					});
				})
				.catch((error) => {
					if (error.response) {
						console.log(error);
					}
				});

			axios
				.get(`http://localhost:5000/appointment/${username}`)
				.then((response) => {
					this.setState({
						appointments: response.data.appointments,
					});
				})
				.catch((error) => {
					if (error.response) {
						console.log(error);
					}
				});

			axios
				.get(`http://localhost:5000/prescription/${username}`)
				.then((response) => {
					this.setState({
						prescriptions: response.data.prescriptions,
					});
				})
				.catch((error) => {
					if (error.response) {
						console.log(error);
					}
				});
		} else {
			this.props.history.push("/");
		}
	}

	render() {
		console.log(this.state);
		return (
			<div>
				<Nav></Nav>
			</div>
		);
	}
}

export default Doctor;
