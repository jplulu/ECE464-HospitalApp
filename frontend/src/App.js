import logo from './logo.svg';
import './App.css';
import {getdoc_admin, addspec_admin} from './components/user_routes'
import {Login} from './components/Login.js'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
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
  return (
      <Router>
        <div className="container">
          <Switch>
            <Route path="/login" exact component={Login}/>
            <Route path="/getDoctors" exact component={getdoc_admin}/>
            <Route path="/addSpec" exact component={addspec_admin}/>
          </Switch>
        </div>
      </Router>
  );
}



export default App;