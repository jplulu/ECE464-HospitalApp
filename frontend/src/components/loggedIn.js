export default function loggedIn() {
	return localStorage.getItem("user") !== null;
}
