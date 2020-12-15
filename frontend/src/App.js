import './App.css';
import Login from './components/Login.js'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Admin from "./components/Admin";
import Patient from "./components/Patient";
import Doctor from "./components/Doctor";
import Nav from "./components/Nav"

function App() {
	return (
		<Router>
			<Nav/>
				<Switch>
					<Route path="/" exact component={Home}/>
					<Route path="/register" exact component={Register}/>
					<Route path="/admin" exact component={Admin}/>
					<Route path="/patient" exact component={Patient}/>
					<Route path="/doctor" exact component={Doctor}/>
					<Route path="/login" exact component={Login}/>
				</Switch>
		</Router>
	);
}



export default App;