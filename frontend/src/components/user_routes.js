import React, {Component} from 'react'
import axios from 'axios';
import {  Table } from "semantic-ui-react";

export class addspec_admin extends Component {
    constructor() {
        super();
        this.state = {
            exist_spec : [],
            new_spec : ""
        }
    };

    handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/specialization',null,{
            params:{
                spec: this.state.new_spec
            }
        })
        console.log(this.state.new_spec)
    };

    handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

    componentDidMount() {
        axios.get('/specialization', null, {
            params: {}
        })
            .then(response=> {
                console.log(response.data)
                this.setState({exist_spec: response.data.specializations})
            })
            .catch(err => console.log(err))
    }



    render(){
        const {new_spec} = this.state;
        return <div>
            <h1>Specializations List</h1>
            <Table>
                <tr>
                  {this.state.exist_spec.map(spec =>
                      <td key={spec.id}>
                          <td>{spec.spec}</td>
                      </td>
                  )}
                </tr>
            </Table>
            <form onSubmit={this.handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="new_spec"
                        placeholder="specialization"
                        value={new_spec}
                        onChange={this.handleChange}
                    />
                </div>
                <div>
                    <button type="submit">Add</button>
                </div>
            </form>
        </div>
    }
}

export class getdoc_admin extends Component{
    constructor() {
        super();
        this.state = {
            doctors:[],
            spec:"This",
            status:"APPROVED"
        }
    }

    componentDidMount() {
        axios.get('/user/getDoctors', null, {
            params: {
                spec: this.state.spec,
                status: this.state.status,
            },
        })
            .then(response=> {
                console.log(response.data)
                this.setState({doctors: response.data.doctors})
            })
            .catch(err => console.log(err))
    }

    render() {
        return (
          <div>
        <h1>Doctor List</h1>
            <Table>
                <tr>
                  {this.state.doctors.map(doctor =>
                      <tr key={doctor.id}>
                          <td>{doctor.email}</td>
                          <td>{doctor.first_name}</td>
                          <td>{doctor.last_name}</td>
                          <td>{doctor.specialization}</td>
                          <td>{doctor.user_status}</td>
                          <td>
                              { (doctor.user_status === "PENDING") ?
                                  <div>
                                      <button onClick={() => {axios.put('/user', null, {
                                          params: {
                                              username: doctor.username,
                                              status: "APPROVED"
                                          }
                                      })}}>Approve user</button>
                                      <button onClick={() => {axios.put('/user', null, {
                                          params: {
                                              username: doctor.username,
                                              status: "REJECTED"
                                          }
                                      })}}>Reject user</button>
                                  </div>
                                  :
                                  null
                              }
                          </td>
                      </tr>
                  )}
                </tr>
            </Table>
      </div>
    )
  }
};

export class getdoc_patient extends Component{
    constructor() {
        super();
        this.state = {
            doctors:[],
            spec:"This",
            status:"APPROVED"
        }
    }

    componentDidMount() {
        axios.get('/user/getDoctors', null, {
            params: {
                spec: this.state.spec,
                status: this.state.status,
            },
        })
            .then(response=> {
                console.log(response.data)
                this.setState({doctors: response.data.doctors})
            })
            .catch(err => console.log(err))
    }

    render() {
        return (
          <div>
        <h1>Doctor List</h1>
            <Table>
                <tr>
                  {this.state.doctors.map(doctor =>
                      <tr key={doctor.id}>
                          <td>{doctor.email}</td>
                          <td>{doctor.first_name}</td>
                          <td>{doctor.last_name}</td>
                          <td>{doctor.specialization}</td>
                      </tr>
                  )}
                </tr>
            </Table>
      </div>
    )
  }
};