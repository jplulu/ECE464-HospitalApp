import React, { Component } from "react";
import loggedIn from "./loggedIn";
import { Getdoc_admin, Addspec_admin } from "./user_routes";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

class Admin extends Component {
	componentDidMount() {
		var usr_type = JSON.parse(localStorage.getItem("user")).user_type;
		if (loggedIn() && usr_type === "ADMIN") {
		} else {
			this.props.history.push("/");
		}
	}

	render() {
		return (
			<div style={{ textAlign: "center", margin: "auto" }}>
				<Tabs>
					<TabList>
						<Tab>Approve/Reject Doctors</Tab>
						<Tab>Add Specializations</Tab>
					</TabList>

					<TabPanel>
						<Getdoc_admin/>
					</TabPanel>
					<TabPanel>
						<Addspec_admin/>
					</TabPanel>
				</Tabs>
			</div>
		);
	}
}

export default Admin;
