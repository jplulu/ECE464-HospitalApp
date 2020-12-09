import logo from './logo.svg';
import './App.css';
import {getdoc_admin, addspec_admin} from './components/user_routes'
import {Login} from './components/Login.js'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

function App() {
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