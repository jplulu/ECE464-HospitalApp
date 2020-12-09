import React, {Component} from 'react'
import axios from 'axios';
import {  Table } from "semantic-ui-react";

export class alldoctor extends Component{
    constructor() {
        super();
        this.state = { doctors: []}
    }

    componentDidMount() {
        axios.get('/user/getAllDoctors', {
            method: 'GET'
        })
            .then(response=>response.json())
            .then(data=> {
                this.setState({doctors: data.doctors})
                console.log(data)
            })
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

export class filterdoc extends Component{
    constructor() {
        super();
        this.state = { doctors: []}
    }

    componentDidMount() {
        axios('/user/getDoctorBySpecialization', {
            method: 'GET'
        })
            .then(response=>response.json())
            .then(data=> {
                this.setState({doctors: data.doctors})
                console.log(data)
            })
    }

    render() {
        return (
          <div>
        <h1>Doctor List</h1>
            <Table>
                <tr>
                  {this.state.doctors}
                </tr>
            </Table>
      </div>
    )
  }
}