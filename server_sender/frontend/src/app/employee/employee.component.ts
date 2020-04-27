import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import IEmployee from "../entity/Employss";

@Component({
  selector: "app-employee",
  templateUrl: "./employee.component.html",
  styleUrls: ["./employee.component.css"],
})
export class EmployeeComponent implements OnInit {
  employeeList: IEmployee[];
  empId: number = null;
  empName: string = "";
  empAge: number = null;
  empSalary: number = null;

  constructor(private _empService: EmployeeService) {}

  ngOnInit(): void {
    this.getEmployeeList();
  }

  getEmployeeList() {
    this._empService.getEmployeeList().subscribe((empList) => {
      this.employeeList = empList;
      console.log(JSON.stringify(this.employeeList, null, 4));
    });
  }

  clearForm() {
    this.empId = null;
    this.empName = "";
    this.empAge = null;
    this.empSalary = null;
  }

  submitAndSendEmployeeRecord() {
    let emp: IEmployee = {};
    emp.empId = this.empId;
    emp.empName = this.empName;
    emp.empAge = this.empAge;
    emp.empSalary = this.empSalary;
    console.log(
      "submitAndSendEmployeeRecord - " + JSON.stringify(emp, null, 4)
    );
    this._empService
      .submitAndSendEmployeeRecord(emp)
      .subscribe((employeeList) => {
        // this.employeeList.push(employeeList);
        this.employeeList = employeeList;
        this.clearForm();
      });
  }

  sendUnsyncEmployeeRecord(){
    this._empService.sendUnsyncEmployeeRecord().subscribe((employeeList) => {
      // this.employeeList.push(employeeList);
      this.employeeList = employeeList;
      this.clearForm();
    });
  }

  async submitEmployeeRecord() {
    let emp: IEmployee = {};
    emp.empId = this.empId;
    emp.empName = this.empName;
    emp.empAge = this.empAge;
    emp.empSalary = this.empSalary;
    console.log("submitEmployeeRecord - " + JSON.stringify(emp, null, 4));
    this._empService.submitEmployeeRecord(emp).subscribe((employee) => {
      this.employeeList.push(employee);
      // this.employeeList = employeeList;
      this.clearForm();
    });
  }
}
