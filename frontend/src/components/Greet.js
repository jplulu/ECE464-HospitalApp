import React, {Component} from 'react'
import {  Table } from "semantic-ui-react";

export class alldoctor extends Component{
    constructor() {
        super();
        this.state = { doctors: []}
    }

    componentDidMount() {
        fetch('/user/getAllDoctors', {
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
