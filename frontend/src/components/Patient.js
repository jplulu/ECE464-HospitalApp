import React, { Component } from "react";
import Nav from "./Nav";
import axios from "axios";
import loggedIn from "./loggedIn";
import {Table} from "semantic-ui-react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {Getdoc_patient} from "./user_routes"

class Patient extends Component{
	constructor(props) {
		super(props);
		this.state = {
			info: {},
			appointments: [],
			prescriptions: [],
			curr_appstatus : "",
			curr_prepstatus:""
		};
	}

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	async componentDidMount() {
		var user = JSON.parse(localStorage.getItem("user"))
		if (loggedIn() && user.user_type == "PATIENT") {
			const username = JSON.parse(localStorage.getItem("user")).username;
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
				console.log(secondResp.data)
			}
			if (thirdResp) {
				prescriptions = thirdResp.data.prescriptions;
			}
			this.setState({
				info: info,
				appointments: appointments,
				prescriptions: prescriptions,
			});
			console.log(this.state.appointments)
		} else {
			this.props.history.push("/");
		}
	}

	handleappfilter = (e) => {
		const username = JSON.parse(localStorage.getItem("user")).username;
		e.preventDefault();
		console.log(this.state.curr_appstatus)
		axios
			.get(`http://localhost:5000/appointment/${username}`, {
			params: {
				status: this.state.curr_appstatus,
			},})
			.then((data) => {
				this.setState({appointments: data.data.appointments})
				console.log(this.state.appointments)
			})
			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
				this.setState({ appointments: [] });
			});
		this.forceUpdate();
	};

	handleprepfilter = (e) => {
		const username = JSON.parse(localStorage.getItem("user")).username;
		e.preventDefault();
		console.log(this.state.curr_appstatus)
		axios
			.get(`http://localhost:5000/prescription/${username}`, {
			params: {
				status: this.state.curr_prepstatus,
			},})
			.then((data) => {
				this.setState({prescriptions: data.data.prescriptions})
				console.log(this.state.prescriptions)
			})
			.catch((error) => {
				if (error.response) {
					console.log(error);
				}
				this.setState({ prescriptions: [] });
			});
		this.forceUpdate();
	};

	getAge = (dob) => {
		let today = new Date();
		let birthDate = new Date(dob);
		console.log(birthDate);
		let age = today.getFullYear() - birthDate.getFullYear();
		let m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	render() {
		const {curr_appstatus, curr_prepstatus} = this.state
		let appointmentsMarkup = (
			<div>
				<h1>My Appointments</h1>
				<form onSubmit={this.handleappfilter}>
					<select name="curr_appstatus" value={curr_appstatus} onChange={this.handleChange}>
						<option value="">ALL</option>
						<option value="CANCELED">CANCELED</option>
						<option value="PENDING">PENDING</option>
						<option value="ACTIVE">ACTIVE</option>
						<option value="COMPLETE">COMPLETE</option>
					</select>
					<button type="submit">Filter</button>
				</form>
			<Table>
				<tbody>
					<tr>
						<td>
							<b>Name</b>
						</td>
						<td>
							<b>Age</b>
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
								{appointment.doctor.first_name + " " +
									appointment.doctor.last_name}
							</td>
							<td>{this.getAge(appointment.doctor.dob)}</td>
							<td>{appointment.doctor.phone_number}</td>
							<td>{appointment.description}</td>
							<td>{appointment.date}</td>
							<td>{appointment.start}</td>
							<td>{appointment.note}</td>
							<td>{appointment.status}</td>
							<td>
									{appointment.status === "PENDING" ? (
										<div>
											<button
												onClick={() => {
													axios.put("http://localhost:5000/appointment", null, {
														params: {
															id: appointment.id,
															status: "CANCELED",
														},
													})
														.then(window.location.reload())
												}}
											>
												Cancel
											</button>
										</div>
									) : null}
								</td>
						</tr>
					))}
				</tbody>
			</Table>
			</div>
		);
		let prescriptionMarkup = (
			<div>
				<h1>My Prescriptions</h1>
				<form onSubmit={this.handleprepfilter}>
					<select name="curr_prepstatus" value={curr_prepstatus} onChange={this.handleChange}>
						<option value="">ALL</option>
						<option value="INACTIVE">INACTIVE</option>
						<option value="ACTIVE">ACTIVE</option>
					</select>
					<button type="submit">Filter</button>
				</form>
			<Table>
				<tbody>
					<tr>
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
						<td>
							<b>Doctor Name</b>
						</td>
					</tr>
					{this.state.prescriptions.map((prescription) => (
						<tr key={prescription.id}>
							<td>{prescription.drug}</td>
							<td>{prescription.date}</td>
							<td>{prescription.dosage}</td>
							<td>{prescription.status}</td>
							<td>{prescription.doctor.first_name + " " +prescription.doctor.last_name }</td>
						</tr>
					))}
				</tbody>
			</Table>
			</div>
		)

		return <div>
			<h1>Patient</h1>
			<Tabs>
				<TabList>
				  <Tab>Appointment</Tab>
				  <Tab>Prescriptions</Tab>
				  <Tab>Doctors</Tab>
				</TabList>

				<TabPanel>
				  <div>{appointmentsMarkup}</div>
				</TabPanel>
				<TabPanel>
				  <div>{prescriptionMarkup}</div>
				</TabPanel>
				<TabPanel>
					<Getdoc_patient></Getdoc_patient>
				</TabPanel>
  			</Tabs>
		</div>;
	}
}

export default Patient;
