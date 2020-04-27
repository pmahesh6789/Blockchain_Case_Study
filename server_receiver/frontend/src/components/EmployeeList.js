import React from 'react';
import SockJS from 'sockjs-client';

export default class EmployeeList extends React.Component {
                 constructor(props) {
                   super(props);
                   this.state = {
                     sock: null,
                     empList: [],
                   };
                 }

                 componentDidMount() {
                   var sock = new SockJS("http://localhost:8002/echo");
                   sock.onopen = function () {
                     console.log("open");
                     sock.send("test");
                   };

                   let self = this;
                   sock.onmessage = function (e) {
                     console.log("message", e.data);
                     const empList = JSON.parse(e.data);
                     self.setState({ empList: empList });
                   };

                   sock.onclose = function () {
                     console.log("close");
                   };
                   self.setState({ sock: sock });
                 }

                 fetchAll = (event) =>{
                  console.log("fetchAll Hit");
                  this.state.sock.send("fetchAll");
                 }

                 render() {
                   return (
                     <div className="col-md-12">
                       <div className="row">
                         <div className="col-md-12">
                           <p className="text-center font-weight-bold">
                             Employee List
                           </p>
                         </div>
                       </div>
                       <br />
                       {/*
                       <div className="row">
                         <div className="col-md-9">&nbsp;</div>
                         <div className="col-md-3 text-right">
                           <button
                             className="btn btn-primary"
                             onClick={() => this.fetchAll()}
                           >
                             Fetch latest all
                           </button>
                         </div>
                       </div> */}
                       <div className="row">
                         <div className="col-md-12">
                           <table className="table table-striped">
                             <thead>
                               <tr>
                                 <th>Emp ID</th>
                                 <th>Emp Name</th>
                                 <th>Emp Age</th>
                                 <th>Emp Salary</th>
                               </tr>
                             </thead>
                             <tbody>
                               {this.state.empList.map((emp, index) => (
                                 <tr
                                   className="font-weight-normal"
                                   key={emp.empId + "_" + index}
                                 >
                                   <td>{emp.empId}</td>
                                   <td>{emp.empName}</td>
                                   <td>{emp.empAge}</td>
                                   <td>{emp.empSalary}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       </div>
                     </div>
                   );
                 }
               }