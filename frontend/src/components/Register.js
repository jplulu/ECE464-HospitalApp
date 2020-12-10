import React, { Component } from "react";
import axios from "axios";
import loggedIn from "./loggedIn";
import Nav from "./Nav";

class Register extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: "",
			username: "",
			password: "",
			confirm_password: "",

			first_name: "",
			last_name: "",
			dob: "",
			phone_number: "",
			specialization: "",
			user_type: "PATIENT",

			spec_list: [],

			errors: {},
		};
	}

	componentDidMount() {
		if (loggedIn()) {
			this.props.history.push("/");
		}
		axios
			.get("http://localhost:5000/specialization")
			.then((response) => {
				this.setState({
					specialization: response.data.specializations[0].spec,
					spec_list: response.data.specializations,
				});
			})
			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
			});
	}

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	validate = () => {
		const {
			email,
			username,
			password,
			confirm_password,
			first_name,
			last_name,
			dob,
			phone_number,
		} = this.state;
		let isValid = true;
		let err = {};
		if (email === "" || !email.includes("@")) {
			isValid = false;
			err.email = "Invalid email";
		}
		if (username === "") {
			isValid = false;
			err.username = "Must not be empty";
		}
		if (password === "") {
			isValid = false;
			err.password = "Must not be empty";
		}
		if (password !== confirm_password) {
			isValid = false;
			err.confirm_password = "Passwords do not match";
		}
		if (first_name === "") {
			isValid = false;
			err.first_name = "Must not be empty";
		}
		if (last_name === "") {
			isValid = false;
			err.last_name = "Must not be empty";
		}
		if (dob === "") {
			isValid = false;
			err.dob = "Must not be empty";
		}
		if (phone_number === "" || !phone_number.match(/^\d{10}$/)) {
			isValid = false;
			err.phone_number = "Invalid phone number";
		}

		this.setState({
			errors: {
				...err,
			},
		});

		return isValid;
	};

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({
			errors: {},
		});
		const isValid = this.validate();

		if (isValid) {
			let newUser = { ...this.state };
			delete newUser.spec_list;
			console.log(newUser);
			console.log(this.state);
			axios
				.post("http://localhost:5000/user/register", newUser)
				.then((response) => {
					const data = response.data;
					const user = {
						id: data.id,
						username: data.username,
						user_type: data.user_type,
						user_status: data.user_status,
					};
					localStorage.setItem("user", JSON.stringify(user));
					this.props.history.push("/");
				})
				.catch((error) => {
					if (error.response) {
						console.log(error);
						this.setState({
							errors: {
								response: error.response.data.error,
							},
						});
					}
				});
		}
	};

	render() {
		const {
			email,
			username,
			password,
			confirm_password,
			first_name,
			last_name,
			dob,
			phone_number,
			specialization,
			user_type,
			spec_list,
			errors,
		} = this.state;

		let signupForm = null;

		if (user_type === "PATIENT") {
			signupForm = (
				<div>
					<div>
						<input
							type="text"
							name="phone_number"
							placeholder="phone number"
							value={phone_number}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.phone_number}</div>
					<div>
						<label>Date of Birth: </label>
						<input
							type="date"
							name="dob"
							value={dob}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.dob}</div>
				</div>
			);
		} else if (user_type === "DOCTOR") {
			signupForm = (
				<div>
					<div>
						<input
							type="text"
							name="phone_number"
							placeholder="phone number"
							value={phone_number}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.phone_number}</div>
					<div>
						<label>Date of Birth: </label>
						<input
							type="date"
							name="dob"
							value={dob}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.dob}</div>
					<div>
						<label>Specialization: </label>
						<select
							name="specialization"
							value={specialization}
							onChange={this.handleChange}
						>
							{spec_list.map((item) => (
								<option key={item.id} value={item.spec}>
									{item.spec}
								</option>
							))}
						</select>
					</div>
				</div>
			);
		}

		return (
			<div>
				<h2>Register</h2>
				<form onSubmit={this.handleSubmit}>
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
					<div>
						<input
							type="text"
							name="email"
							placeholder="email"
							value={email}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.email}</div>
					<div>
						<input
							type="text"
							name="username"
							placeholder="username"
							value={username}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.username}</div>
					<div>
						<input
							type="text"
							name="first_name"
							placeholder="first name"
							value={first_name}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.first_name}</div>
					<div>
						<input
							type="text"
							name="last_name"
							placeholder="last name"
							value={last_name}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.last_name}</div>
					<div>
						<input
							type="password"
							name="password"
							placeholder="password"
							value={password}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.password}</div>
					<div>
						<input
							type="password"
							name="confirm_password"
							placeholder="confirm password"
							value={confirm_password}
							onChange={this.handleChange}
						/>
					</div>
					<div style={{ color: "red" }}>{errors.confirm_password}</div>
					{signupForm}
					<div style={{ color: "red" }}>{errors.response}</div>
					<button type="submit">Register</button>
					<p>
						Already have an account? Login{" "}
						<a href="http://localhost:3000/">here</a>
					</p>
				</form>
			</div>
		);
	}
}

export default Register;
