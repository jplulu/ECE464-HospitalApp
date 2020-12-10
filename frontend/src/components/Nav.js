import React from "react";

const Nav = (props) => {
	function handleLogout() {
		localStorage.removeItem("user");
		window.location.href = "http://localhost:3000/";
	}

	const user = JSON.parse(localStorage.getItem("user"));
	if (user != null) {
		return (
			<div>
				<button onClick={handleLogout}>Logout</button>
			</div>
		);
	} else {
		return (
			<div>
				<h3>Hospital Management System</h3>
			</div>
		);
	}
};

export default Nav;
