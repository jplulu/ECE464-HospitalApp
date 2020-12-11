import React, { Component, Fragment } from "react";
import axios from "axios";
import Popup from "reactjs-popup";
import "./popup.css";
import { Table } from "semantic-ui-react";

class Prescription extends Component {
	constructor(props) {
		super(props);
		this.state = {
			prescription: this.props.prescription,
			new_dosage: this.props.prescription.dosage,
		};
	}

	componentWillReceiveProps(nextProps, nextContext) {
		if (this.props.prescription.id !== nextProps.prescription.id) {
			this.setState({
				prescription: nextProps.prescription,
				new_dosage: nextProps.prescription.dosage,
			});
		}
	}

	handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

	handleUpdateDosage(prescription_id) {
		axios
			.put("http://localhost:5000/prescription", null, {
				params: {
					id: prescription_id,
					dosage: this.state.new_dosage,
				},
			})
			.then(() => {
				console.log("success");
				window.location.reload();
			})
			.catch((error) => console.log(error));
	}

	render() {
		const { prescription, new_dosage } = this.state;
		console.log(prescription);
		return (
			<Fragment>
				<tr key={prescription.id}>
					<td>
						{`${prescription.patient.first_name} ${prescription.patient.last_name}`}
					</td>
					<td>{prescription.drug}</td>
					<td>{prescription.date}</td>
					<td>{prescription.dosage}</td>
					<td>{prescription.status}</td>
					<td>
						{prescription.status === "ACTIVE" ? (
							<div>
								<button
									onClick={() => {
										axios
											.put("http://localhost:5000/prescription", null, {
												params: {
													id: prescription.id,
													status: "INACTIVE",
												},
											})
											.then(() => {
												console.log("success");
												window.location.reload();
											})
											.catch((error) => console.log(error));
									}}
								>
									Deactivate
								</button>
							</div>
						) : null}
					</td>
					<td>
						{prescription.status === "ACTIVE" ? (
							<Popup
								trigger={<button className="button"> Update Dosage </button>}
								modal
								nested
							>
								{(close) => (
									<div className="modal">
										<form
											onSubmit={() => {
												this.handleUpdateDosage(prescription.id);
												close();
											}}
										>
											<textarea
												name="new_dosage"
												cols="30"
												rows="10"
												value={new_dosage}
												onChange={this.handleChange}
											></textarea>
											<button type="submit">Submit</button>
										</form>
									</div>
								)}
							</Popup>
						) : null}
					</td>
				</tr>
			</Fragment>
		);
	}
}

export default Prescription;
