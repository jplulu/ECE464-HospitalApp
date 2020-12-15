import React, { Component } from "react";
import axios from "axios";
import { Table } from "semantic-ui-react";
import Popup from "reactjs-popup";
import "./popup.css";
import loggedIn from "./loggedIn";

export class Addspec_admin extends Component {
	constructor() {
		super();
		this.state = {
			exist_spec: [],
			new_spec: "",
		};
	}

	handleSubmit = (e) => {
		e.preventDefault();
		axios
			.post("http://localhost:5000/specialization", null, {
				params: {
					spec: this.state.new_spec,
				},
			})
			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
			});
		window.location.reload();
	};

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	componentDidMount() {
		if (loggedIn()) {
			axios
				.get("http://localhost:5000/specialization", null, {
					params: {},
				})
				.then((response) => {
					console.log(response.data);
					this.setState({ exist_spec: response.data.specializations });
				})
				.catch((err) => console.log(err));
		} else {
			this.props.history.push("/");
		}
	}

	render() {
		const { new_spec } = this.state;
		return (
			<div style={{ textAlign: "center", margin: "auto" }}>
				<h1>Specializations List</h1>
				<form onSubmit={this.handleSubmit}>
					<div>
						<label>Add Specialization</label>
						<input
							type="text"
							name="new_spec"
							placeholder="specialization"
							value={new_spec}
							onChange={this.handleChange}
						/>
					</div>
					<div>
						<button type="submit">Add</button>
					</div>
				</form>
				<br/>
				<Table style={{ textAlign: "center", margin: "auto" }}>
					<tbody>
						{this.state.exist_spec.map((spec) => (
							<tr key={spec.id}>
								<td>{spec.spec}</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		);
	}
}

export class Getdoc_admin extends Component {
	constructor() {
		super();
		this.state = {
			doctors: [],
			spec: "This",
			status: "APPROVED",
			admin_doc_status: ""
		};
	}

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	componentDidMount() {
		if (loggedIn()) {
			axios
				.get("http://localhost:5000/user/getDoctors", null, {
					params: {
						spec: this.state.spec,
						status: this.state.status,
					},
				})
				.then((response) => {
					console.log(response.data);
					this.setState({ doctors: response.data.doctors });
				})
				.catch((err) => console.log(err));
		} else {
			this.props.history.push("/");
		}
	}

	handledocFilter = (e) => {
		console.log(this.state.admin_doc_status)
		e.preventDefault();
		axios
			.get("http://localhost:5000/user/getDoctors", {
				params: {
					status: this.state.admin_doc_status,
				},
			})
			.then((data) => {
				this.setState({ doctors: data.data.doctors });
				console.log(this.state.doctors);
			})
			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
				this.setState({doctors: []});
			});
		this.forceUpdate();
	}

	render() {
		return (
			<div>
				<h1 align="center">Doctor List</h1>
				<form onSubmit={this.handledocFilter}>
							<select name="admin_doc_status" value={this.state.admin_doc_status} onChange={this.handleChange}>
								<option value="">All Status</option>
								<option value="PENDING">PENDING</option>
								<option value="APPROVED">APPROVED</option>
								<option value="REJECTED">REJECTED</option>
							</select>
							<button type="submit">Filter</button>
						</form>
				<Table align="center">
					<tr>
						<tr>
							<td><b>Email</b></td>
							<td><b>Name</b></td>
							<td><b>Specialization</b></td>
							<td><b>User status</b></td>
						</tr>
						{this.state.doctors.map((doctor) => (
							<tr key={doctor.id}>
								<td>{doctor.email}</td>
								<td>{doctor.first_name + " " + doctor.last_name}</td>
								<td>{doctor.specialization}</td>
								<td>{doctor.user_status}</td>
								<td>
									{doctor.user_status === "PENDING" ? (
										<div>
											<button
												onClick={() => {
													axios
														.put("http://localhost:5000/user", null, {
															params: {
																username: doctor.username,
																status: "APPROVED",
															},
														})
														.then(() => {
															window.location.reload();
														})
														.catch((error) => console.log(error));
												}}
											>
												Approve user
											</button>
											<button
												onClick={() => {
													axios
														.put("http://localhost:5000/user", null, {
															params: {
																username: doctor.username,
																status: "REJECTED",
															},
														})
														.then(() => {
															window.location.reload();
														})
														.catch((error) => console.log(error));
												}}
											>
												Reject user
											</button>
										</div>
									) : null}
								</td>
							</tr>
						))}
					</tr>
				</Table>
			</div>
		);
	}
}

export class Getdoc_patient extends Component {
	constructor() {
		super();
		this.state = {
			doctors: [],
			spec: "",
			status: "APPROVED",
			exist_spec: [],
			selected_doctor: "",
			description: "",
			date: "",
			start: "",
			curr_user: {},
		};
	}

	componentDidMount() {
		if (loggedIn()) {
			const user = JSON.parse(localStorage.getItem("user"));
			this.setState({ curr_user: user });
			axios
				.all([
					axios.get("http://localhost:5000/user/getDoctors", {
						params: {
							status: this.state.status,
						},
					}),
					axios.get("http://localhost:5000/specialization", null, {
						params: {},
					}),
				])
				.then(
					axios.spread((data1, data2) => {
						console.log("data1", data1.data, "data2", data2.data);
						this.setState({ doctors: data1.data.doctors });
						this.setState({ exist_spec: data2.data.specializations });
					})
				);
		} else {
			this.props.history.push("/");
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();
		axios
			.get("http://localhost:5000/user/getDoctors", {
				params: {
					status: this.state.status,
					spec: this.state.spec,
				},
			})
			.then((data) => {
				this.setState({ doctors: data.data.doctors });
				console.log(this.state.doctors);
			})

			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
				this.setState({ doctors: [] });
			});
		this.forceUpdate();
	};

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleCreateAppointment(doc_usrname) {
		axios
			.post("http://localhost:5000/appointment", {
				patient: this.state.curr_user.username,
				doctor: doc_usrname,
				description: this.state.description,
				date: this.state.date,
				start: this.state.start,
			})
			.catch((error) => {
				console.log(error.response.data.error);
			})
			.then(window.location.reload());
	}

	getAge = (dob) => {
		let today = new Date();
		let birthDate = new Date(dob);
		console.log(birthDate);
		console.log(today);
		let age = today.getFullYear() - birthDate.getFullYear();
		let m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	render() {
		const {
			exist_spec,
			spec,
			description,
			date,
			start
		} = this.state;
		let SpecOptions = exist_spec.map((s) => (
			<option value={s.spec}>{s.spec}</option>
		));
		return (
			<div align="center">
				<h1>Make appointment</h1>
				<h2>Doctor List</h2>
				<form onSubmit={this.handleSubmit}>
					<select name="spec" value={spec} onChange={this.handleChange}>
						<option value="">All Specializations</option>
						{SpecOptions}
					</select>
					<button type="submit">Filter</button>
				</form>
				<Table>
					<tbody>
						<tr>
							<td>
								<b>Email</b>
							</td>
							<td>
								<b>First Name</b>
							</td>
							<td>
								<b>Last Name</b>
							</td>
							<td>
								<b>Specialization</b>
							</td>
							<td>
								<b>Age</b>
							</td>
							<td>
								<b>Phone Number</b>
							</td>
						</tr>
						{this.state.doctors.map((doctor) => (
							<tr key={doctor.id}>
								<td>{doctor.email}</td>
								<td>{doctor.first_name}</td>
								<td>{doctor.last_name}</td>
								<td>{doctor.specialization}</td>
								<td>{this.getAge(doctor.dob)}</td>
								<td>{doctor.phone_number}</td>
								<Popup
									trigger={
										<button className="button"> Create Appointment </button>
									}
									modal
									nested
								>
									{(close) => (
										<div className="modal">
											<form
												onSubmit={() => {
													this.handleCreateAppointment(doctor.username);
													close();
												}}
											>
												<h3>New Appointment</h3>
												<textarea
													cols="30"
													rows="10"
													type="text"
													name="description"
													placeholder="description"
													value={description}
													onChange={this.handleChange}
												/>
												<input
													type="date"
													name="date"
													value={date}
													onChange={this.handleChange}
												/>
												<input
													type="time"
													name="start"
													placeholder="start"
													value={start}
													onChange={this.handleChange}
												/>
												<button type="submit">Create</button>
											</form>
										</div>
									)}
								</Popup>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		);
	}
}
