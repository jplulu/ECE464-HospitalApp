import "./App.css";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
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
				</Switch>
		</Router>
	);
}

export default App;
