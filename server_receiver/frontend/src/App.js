import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import EmployeeList from './components/EmployeeList';

function App() {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-3">&nbsp;</div>
        <div className="col-md-6">
          <p className="app-title">Blockchain case study</p>
          <p className="app-sub-title">Data Receiver Application.</p>
        </div>
        <div className="col-md-3">&nbsp;</div>
      </div>
      <br />
      <br />
      <EmployeeList></EmployeeList>
    </div>
  );
}

export default App;
