import React from "react";

const Nav = (props) => {
	function handleLogout() {
		localStorage.removeItem("user");
		window.location.href = "http://localhost:3000/";
	}

	const user = JSON.parse(localStorage.getItem("user"));
	if (user != null) {
		if (user.user_type === "ADMIN") {
			return (
				<div>
					<button onClick={handleLogout}>Logout</button>
					<h1 style={{ textAlign: "center" }}>Admin View</h1>
				</div>
			);
		} else if (user.user_type === "PATIENT") {
			return (
				<div>
					<button onClick={handleLogout}>Logout</button>
					<h1 style={{ textAlign: "center" }}>Patient View</h1>
				</div>
			);
		} else {
			return (
				<div>
					<button onClick={handleLogout}>Logout</button>
					<h1 style={{ textAlign: "center" }}>Doctor View</h1>
				</div>
			);
		}
	} else {
		return (
			<div>
				<h3>Hospital Management System</h3>
			</div>
		);
	}
};

export default Nav;
