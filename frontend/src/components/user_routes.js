import React, {Component} from 'react'
import axios from 'axios';
import {  Table } from "semantic-ui-react";
import Popup from 'reactjs-popup';
import './popup.css'


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
            spec:"",
            status:"APPROVED",
            exist_spec : [],
            selected_doctor:'',
            description:'',
            date:'',
            start:'',
            curr_user:{}
        }
    }

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem("user"));
        this.setState({curr_user: user})
        axios.all([
            axios.get('/user/getDoctors', null, {
            params: {
                spec: this.state.spec,
                status: this.state.status,
            }}),
            axios.get('/specialization', null, {
            params: {}
            })
        ])
            .then(axios.spread((data1, data2) => {
                console.log('data1', data1.data, 'data2', data2.data)
                this.setState({doctors: data1.data.doctors})
                this.setState({exist_spec: data2.data.specializations})
    }))
    }

    handleSubmit = (e) => {
        e.preventDefault();
        axios.get('/user/getDoctors', {
            params: {
                spec: this.state.spec
            }})
            .then(data => {
                this.setState({doctors: data.data.doctors})
                console.log(this.state.doctors)
            })

        .catch((error) => {
            if (error.response) {console.log(error);}
            this.setState({doctors: []})
        }
        )
        this.forceUpdate()
    };

    handleChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value,
		});
	};

    handleCreateAppointment(doc_usrname){
        console.log(this.state.selected_doctor)
        console.log(this.state.description)
        console.log(this.state.date)
        console.log(this.state.start)
        console.log(doc_usrname)


        axios.post('/appointment', {
            patient:this.state.curr_user.username,
            doctor:doc_usrname,
            description:this.state.description,
            date:this.state.date,
            start:this.state.start
        })
            .catch((error)=>{
                console.log(error.response.data.error)
            })
    }

    render() {
        const {exist_spec,spec, description, date, start, selected_doctor} = this.state
        let SpecOptions = exist_spec.map((s) =>
            <option value={s.spec}>{s.spec}</option>
        );
        return (
          <form onSubmit={this.handleSubmit}>
              <div>
					<select
                        name="spec"
                        value={spec}
                        onChange={this.handleChange}
                    >
                        <option value="">All Specializations</option>
                        {SpecOptions}
					</select>
				</div>
              <button type="submit">Filter</button>
                <h1>Doctor List</h1>
                    <Table>
                        <tbody>
                        <tr>
                            <td>Email</td>
                            <td>First Name</td>
                            <td>Last Name</td>
                            <td>Specialization</td>
                            <td>Date of Birth</td>
                            <td>Phone Number</td>
                        </tr>
                          {this.state.doctors.map(doctor =>
                              <tr key={doctor.id}>
                                  <td>{doctor.email}</td>
                                  <td>{doctor.first_name}</td>
                                  <td>{doctor.last_name}</td>
                                  <td>{doctor.specialization}</td>
                                  <td>{doctor.dob}</td>
                                  <td>{doctor.phone_number}</td>
                                  <Popup classname="modal" trigger={<button className="button"> Create Appointment </button>} modal>
                                      <form onSubmit={()=>this.handleCreateAppointment(doctor.username)}>
                                          <input
                                                type="text"
                                                name="description"
                                                placeholder="description"
                                                value={description}
                                                onChange={this.handleChange}
                                          />
                                          <input
                                                type="date"
                                                name="date"
                                                value={date}
                                                onChange={this.handleChange}
                                          />
                                          <input
                                                type="time"
                                                name="start"
                                                placeholder="start"
                                                value={start}
                                                onChange={this.handleChange}
                                          />
                                        <button type="submit">Create</button>
                                      </form>
                                  </Popup>

                              </tr>
                          )}
                        </tbody>
                    </Table>
          </form>
    )
  }
};