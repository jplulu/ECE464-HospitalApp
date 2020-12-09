import logo from './logo.svg';
import './App.css';
import {home} from './components/Greet'
import Welcome from "./components/Welcome";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

function App() {
  return (
      <Router>
        <div className="container">
          <Switch>
            <Route path="/getAllDoctors" exact component={home}/>
          </Switch>
        </div>
      </Router>
  );
}



export default App;
