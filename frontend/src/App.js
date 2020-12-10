import logo from './logo.svg';
import './App.css';
import {getdoc_admin, addspec_admin, getdoc_patient} from './components/user_routes'
import {Login} from './components/Login.js'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Admin from "./components/Admin";
import Patient from "./components/Patient";
import Doctor from "./components/Doctor";

function App() {
	return (
		<Router>
				<Switch>
					<Route path="/" exact component={Home}/>
					<Route path="/register" exact component={Register}/>
					<Route path="/admin" exact component={Admin}/>
					<Route path="/patient" exact component={Patient}/>
					<Route path="/doctor" exact component={Doctor}/>
					<Route path="/login" exact component={Login}/>
            		<Route path="/getDoctorsadmin" exact component={getdoc_admin}/>
            		<Route path="/getDoctorspat" exact component={getdoc_patient}/>
            		<Route path="/addSpec" exact component={addspec_admin}/>
				</Switch>
		</Router>
	);
}



export default App;