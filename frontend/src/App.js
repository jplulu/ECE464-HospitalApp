import './App.css';
import {getdoc_admin, addspec_admin, getdoc_patient} from './components/user_routes'
import Login from './components/Login.js'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Admin from "./components/Admin";
import Patient from "./components/Patient";
import Doctor from "./components/Doctor";
import Nav from "./components/Nav"
import {Patient_appointment} from "./components/Patient"

function App() {
	return (
		<Router>
			<Nav></Nav>
				<Switch>
					<Route path="/" exact component={Home}/>
					<Route path="/register" exact component={Register}/>
					<Route path="/admin" exact component={Admin}/>
					<Route path="/patient" exact component={Patient}/>
					<Route path="/doctor" exact component={Doctor}/>
					<Route path="/login" exact component={Login}/>
          			<Route path="/doctor/getDoctors" exact component={getdoc_admin}/>
					<Route path="/patient/getDoctors" exact component={getdoc_patient}/>
					<Route path="/admin/addSpec" exact component={addspec_admin}/>
					<Route path="/patient/appointments" exact component={Patient_appointment}/>
				</Switch>
		</Router>
	);
}



export default App;