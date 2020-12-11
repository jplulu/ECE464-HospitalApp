import React, { Component } from "react";
import axios from "axios";
import { Table } from "semantic-ui-react";
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

	async componentDidMount() {
		if (loggedIn()) {
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
				appointments = secondResp.data;
			}
			if (thirdResp) {
				prescriptions = thirdResp.data;
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

	getAge = (dob) => {
		let today = new Date();
		let birthDate = new Date(dob);
		console.log(birthDate);
		let age = today.getFullYear() - birthDate.getFullYear;
		let m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	};

	render() {
		let appointmentsMarkup = (
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
								{appointment.patient.first_name +
									appointment.patient.first_name}
							</td>
							<td>{this.getAge(appointment.patient.dob)}</td>
							<td>{appointment.patient.phone_number}</td>
							<td>{appointment.description}</td>
							<td>{appointment.date}</td>
							<td>{appointment.start}</td>
							<td>{appointment.note}</td>
							<td>{appointment.status}</td>
							{/* <Popup
								classname="modal"
								trigger={
									<button className="button"> Create Appointment </button>
								}
								modal
							>
								<form
									onSubmit={() => this.handleCreateAppointment(doctor.username)}
								>
									<input
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
							</Popup> */}
						</tr>
					))}
				</tbody>
			</Table>
		);

		return <div></div>;
	}
}

export default Doctor;
