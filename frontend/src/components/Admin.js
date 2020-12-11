import React, { Component } from "react";
import Nav from "./Nav";
import loggedIn from "./loggedIn";
import {Getdoc_admin, Addspec_admin} from "./user_routes"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

class Admin extends Component {
	componentDidMount() {
		if (!loggedIn()) {
			this.props.history.push("/");
		}
	}

	render() {
		return (
		<div>
			<h1 align="center">Admin</h1>
			<Tabs>
				<TabList>
				  <Tab>Add Specilizations</Tab>
				  <Tab>Approve/Reject Doctors</Tab>
				</TabList>

				<TabPanel>
				  <Addspec_admin></Addspec_admin>
				</TabPanel>
				<TabPanel>
				  <Getdoc_admin></Getdoc_admin>
				</TabPanel>
  			</Tabs>
		</div>
	)
	}
}

export default Admin;
