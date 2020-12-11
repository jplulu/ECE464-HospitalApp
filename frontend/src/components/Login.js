import React, { Component } from "react";
import axios from "axios";

class Login extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			password: "",
			user_type: "PATIENT",
			emailError: "",
			passwordError: "",
			responseError: "",
		};
	}

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	validate = () => {
		const { email, password } = this.state;
		let emailError = "";
		let passwordError = "";
		// if (email === "" || !email.includes("@")) {
		// 	emailError = "Invalid email";
		// }
		if (email === "") {
			emailError = "Must not be empty";
		}
		if (password === "") {
			passwordError = "Must not be empty";
		}
		if (emailError || passwordError) {
			this.setState({
				emailError: emailError,
				passwordError: passwordError,
			});
			return false;
		}
		return true;
	};

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({
			emailError: "",
			passwordError: "",
			responseError: "",
		});
		const isValid = this.validate();
		if (isValid) {
			// console.log(this.state);
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
					window.location.href = "http://localhost:3000/";
				})
				.catch((error) => {
					if (error.response) {
						this.setState({
							responseError: error.response.data.error,
						});
					}
				});
		}
	};

	render() {
		const {
			email,
			password,
			user_type,
			emailError,
			passwordError,
			responseError,
		} = this.state;
		return (
			<form onSubmit={this.handleSubmit}>
				<div>
					<h1>Login</h1>
					<label>Role </label>
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
				<div style={{ color: "red" }}>{emailError}</div>
				<div>
					<input
						type="password"
						name="password"
						placeholder="password"
						value={password}
						onChange={this.handleChange}
					/>
				</div>
				<div style={{ color: "red" }}>{passwordError}</div>
				<div style={{ color: "red" }}>{responseError}</div>
				<button type="submit">Login</button>
				<p>
					Don't have an account? Sign up{" "}
					<a href="http://localhost:3000/register">here</a>
				</p>
			</form>
		);
	}
}

export default Login;
