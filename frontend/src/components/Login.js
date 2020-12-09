import React, { Component } from "react";
import axios from "axios";

class Login extends Component {
	constructor() {
		super();
		this.state = {
			email: "",
			password: "",
			user_type: "PATIENT",
		};
	}

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleSubmit = (e) => {
		e.preventDefault();
		console.log(this.state);
		//axios.defaults.adapter = require("axios/lib/adapters/http");
		axios
			.post("http://localhost:5000/user/login", null, {
				params: {
					email: this.state.email,
					password: this.state.password,
					user_type: this.state.user_type,
				},
			})
			.then((response) => {
				const user = JSON.stringify(response.data);
				localStorage.setItem("user", user);
			})
			.catch((error) => {
				console.log(error.response.data.error);
			});
	};

	render() {
		const { email, password, user_type } = this.state;
		return (
			<form onSubmit={this.handleSubmit}>
				<div>
					<select
						name="user_type"
						value={user_type}
						onChange={this.handleChange}
					>
						<option value="PATIENT">Patient</option>
						<option value="DOCTOR">Doctor</option>
						<option value="ADMIN">Admin</option>
					</select>
				</div>
				<div>
					<input
						type="text"
						name="email"
						placeholder="email"
						value={email}
						onChange={this.handleChange}
					/>
				</div>
				<div>
					<input
						type="password"
						name="password"
						placeholder="password"
						value={password}
						onChange={this.handleChange}
					/>
				</div>
				<button type="submit">Login</button>
			</form>
		);
	}
}

export default Login;
