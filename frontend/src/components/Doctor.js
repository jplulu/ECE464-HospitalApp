import React, { Component } from "react";
import axios from "axios";
import { Table } from "semantic-ui-react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Popup from "reactjs-popup";
import "./popup.css";
import loggedIn from "./loggedIn";
import Prescription from "./prescription";

class Doctor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			info: {},
			appointments: [],
			prescriptions: [],

			appointment_status: "",
			prescription_status: "",

			note: "",

			drug: "",
			dosage: "",
		};
	}

	async componentDidMount() {
		const user = JSON.parse(localStorage.getItem("user"));
		if (loggedIn() && user.user_type === "DOCTOR") {
			const username = user.username;
			let appointments = [];
			let prescriptions = [];
			const [firstResp, secondResp, thirdResp] = await Promise.all([
				axios.get(`http://localhost:5000/user?&username=${username}`),
				axios
					.get(`http://localhost:5000/appointment/${username}`)
					.catch((error) => {
						console.log(error.response);
					}),
				axios
					.get(`http://localhost:5000/prescription/${username}`)
					.catch((error) => {
						console.log(error.response);
					}),
			]);
			let info = firstResp.data;
			if (secondResp) {
				appointments = secondResp.data.appointments;
			}
			if (thirdResp) {
				prescriptions = thirdResp.data.prescriptions;
			}
			this.setState({
				info: info,
				appointments: appointments,
				prescriptions: prescriptions,
			});
		} else {
			this.props.history.push("/");
		}
	}

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleAddNote(app_id) {
		axios
			.put("http://localhost:5000/appointment", null, {
				params: {
					id: app_id,
					note: this.state.note,
				},
			})
			.then(() => {
				console.log("success");
				axios
					.get(`http://localhost:5000/appointment/${this.state.info.username}`)
					.catch((error) => {
						console.log(error.response);
					})
					.then((response) => {this.setState({appointments : response.data.appointments})})
			})
			.catch((error) => console.log(error));
		this.forceUpdate();
	}

	handleAppointmentFilter = (e) => {
		e.preventDefault();
		axios
			.get(`http://localhost:5000/appointment/${this.state.info.username}`, {
				params: {
					status: this.state.appointment_status,
				},
			})
			.then((response) => {
				this.setState({ appointments: response.data.appointments });
				console.log(this.state.appointments);
			})

			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
				this.setState({ appointments: [] });
			});
		this.forceUpdate();
	};

	handlePrescriptionFilter = (e) => {
		e.preventDefault();
		axios
			.get(`http://localhost:5000/prescription/${this.state.info.username}`, {
				params: {
					status: this.state.prescription_status,
				},
			})
			.then((response) => {
				this.setState({ prescriptions: response.data.prescriptions });
				console.log(this.state.prescriptions);
				this.forceUpdate();
			})
			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
				this.setState({ prescriptions: [] });
			});
	};

	handleAddPrescription(patient_username) {
		let d = new Date(),
			month = "" + (d.getMonth() + 1),
			day = "" + d.getDate(),
			year = d.getFullYear();

		if (month.length < 2) month = "0" + month;
		if (day.length < 2) day = "0" + day;

		const today = [year, month, day].join("-");

		const new_prescription = {
			patient: patient_username,
			doctor: this.state.info.username,
			drug: this.state.drug,
			dosage: this.state.dosage,
			date: today,
		};
		axios
			.post("http://localhost:5000/prescription", new_prescription)
			.then(() => {
				console.log("success");
				axios
					.get(`http://localhost:5000/prescription/${this.state.info.username}`)
					.catch((error) => {
						console.log(error.response);
					})
					.then((response) => {
						this.setState({
							prescriptions : response.data.prescriptions,
							dosage : "",
							drug : "",
						})
					})
			})
			.catch((error) => console.log(error));
	}

	getAge = (dob) => {
		let today = new Date();
		let birthDate = new Date(dob);
		let age = today.getFullYear() - birthDate.getFullYear();
		let m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	render() {
		const user_status = this.state.info.user_status;
		console.log(this.state.info.user_status)
		if (user_status !== "APPROVED") {
			console.log(user_status)
			return user_status === "PENDING" ? (
				<div style={{ textAlign: "center", margin: "auto" }}>
					<br></br>
					<h1>Your account has not been approved.</h1>
					<h2>The admin team is working on it.</h2>
				</div>
			) : (
				<div style={{ textAlign: "center", margin: "auto" }}>
					<br></br>
					<h1>Your account has been rejected.</h1>
					<h2>Please contact the admin team for more info.</h2>
				</div>
			);
		}

		const {
			prescriptions,
			note,
			appointment_status,
			prescription_status,
			dosage,
			drug,
		} = this.state;
		let appointmentsMarkup = (
			<div style={{ textAlign: "center", margin: "auto" }}>
				<h2>My Appointments</h2>
				<br></br>
				<form onSubmit={this.handleAppointmentFilter}>
					<select
						name="appointment_status"
						value={appointment_status}
						onChange={this.handleChange}
					>
						<option value="">All Status</option>
						<option value="CANCELED">Canceled</option>
						<option value="PENDING">Pending</option>
						<option value="ACTIVE">Active</option>
						<option value="COMPLETE">Complete</option>
					</select>
					<button type="submit">Filter</button>
				</form>
				<Table style={{ textAlign: "center", margin: "auto" }}>
					<tbody>
						<tr>
							<td>
								<b>Patient Name</b>
							</td>
							<td>
								<b>Age</b>
							</td>
							<td>
								<b>Email</b>
							</td>
							<td>
								<b>Phone Number</b>
							</td>
							<td>
								<b>Description</b>
							</td>
							<td>
								<b>Date</b>
							</td>
							<td>
								<b>Time</b>
							</td>
							<td>
								<b>Note</b>
							</td>
							<td>
								<b>Status</b>
							</td>
						</tr>
						{this.state.appointments.map((appointment) => (
							<tr key={appointment.id}>
								<td>
									{`${appointment.patient.first_name} ${appointment.patient.last_name}`}
								</td>
								<td>{this.getAge(appointment.patient.dob)}</td>
								<td>{appointment.patient.email}</td>
								<td>{appointment.patient.phone_number}</td>
								<td>{appointment.description}</td>
								<td>{appointment.date}</td>
								<td>{appointment.start}</td>
								<td>{appointment.doctor_notes}</td>
								<td>{appointment.status}</td>
								<td>
									{appointment.status === "PENDING" ? (
										<div>
											<button
												onClick={() => {
													axios
														.put("http://localhost:5000/appointment", null, {
															params: {
																id: appointment.id,
																status: "ACTIVE",
															},
														})
														.then(() => {
															console.log("success");
															window.location.reload();
														})
														.catch((error) => console.log(error));
												}}
											>
												Approve
											</button>
											<button
												onClick={() => {
													axios
														.put("http://localhost:5000/appointment", null, {
															params: {
																id: appointment.id,
																status: "CANCELED",
															},
														})
														.then(() => {
															console.log("success");
															window.location.reload();
														})
														.catch((error) => console.log(error));
												}}
											>
												Reject
											</button>
										</div>
									) : null}
									{appointment.status === "ACTIVE" ? (
										<div>
											<button
												onClick={() => {
													axios
														.put("http://localhost:5000/appointment", null, {
															params: {
																id: appointment.id,
																status: "COMPLETE",
															},
														})
														.then(() => {
															console.log("success");
															window.location.reload();
														})
														.catch((error) => console.log(error));
												}}
											>
												Complete
											</button>
										</div>
									) : null}
								</td>
								<td>
									<Popup
										trigger={<button className="button"> Update Note </button>}
										modal
										nested
									>
										{(close) => (
											<div className="modal">
												<div className="content">
													<form
														onSubmit={() => {
															this.handleAddNote(appointment.id);
															close();
														}}
													>
														<textarea
															name="note"
															cols="30"
															rows="10"
															value={note}
															onChange={this.handleChange}
														></textarea>
														<button type="submit">Submit</button>
													</form>
												</div>
											</div>
										)}
									</Popup>
								</td>
								<td>
									{appointment.status === "ACTIVE" ||
									appointment.status === "COMPLETE" ? (
										<Popup
											trigger={
												<button className="button"> Add Prescription </button>
											}
											modal
											nested
										>
											{(close) => (
												<div className="modal">
													<h3 className="header">New Prescription</h3>
													<div className="content">
														<form
															onSubmit={() => {
																this.handleAddPrescription(
																	appointment.patient.username
																);
																close();
															}}
														>
															<textarea
																name="drug"
																placeholder="Drug"
																cols="20"
																rows="10"
																value={drug}
																onChange={this.handleChange}
															></textarea>
															<textarea
																name="dosage"
																placeholder="Dosage"
																cols="20"
																rows="10"
																value={dosage}
																onChange={this.handleChange}
															></textarea>
															<button type="submit">Submit</button>
														</form>
													</div>
												</div>
											)}
										</Popup>
									) : null}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		);

		let prescriptionMarkup = (
			<div style={{ textAlign: "center" }}>
				<h2>Given Prescriptions</h2>
				<form onSubmit={this.handlePrescriptionFilter}>
					<select
						name="prescription_status"
						value={prescription_status}
						onChange={this.handleChange}
					>
						<option value="">All</option>
						<option value="INACTIVE">Inactive</option>
						<option value="ACTIVE">Active</option>
					</select>
					<button type="submit">Filter</button>
				</form>
				<br></br>
				<Table style={{ textAlign: "center", margin: "auto" }}>
					<tbody>
						<tr>
							<td>
								<b>Patient Name</b>
							</td>
							<td>
								<b>Drug</b>
							</td>
							<td>
								<b>Date</b>
							</td>
							<td>
								<b>Dosage</b>
							</td>
							<td>
								<b>Status</b>
							</td>
						</tr>
						{prescriptions.map((prescription) => (
							<Prescription prescription={prescription}></Prescription>
						))}
					</tbody>
				</Table>
			</div>
		);

		return (
			<div>
				<Tabs>
					<TabList>
						<Tab>Appointments</Tab>
						<Tab>Prescriptions</Tab>
					</TabList>

					<TabPanel>
						<div>{appointmentsMarkup}</div>
					</TabPanel>
					<TabPanel>
						<div>{prescriptionMarkup}</div>
					</TabPanel>
				</Tabs>
			</div>
		);
	}
}

export default Doctor;
