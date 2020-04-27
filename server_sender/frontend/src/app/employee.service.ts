import { Injectable } from '@angular/core';
import IEmployee from "./entity/Employss";
import { Observable, of } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" })
};

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  _url: string = "http://127.0.0.1:8001/";

  constructor(private _http: HttpClient) {}

  getEmployeeList(): Observable<IEmployee[]> {
    return this._http.get<IEmployee[]>(this._url + "emplist", httpOptions);
  }

  submitEmployeeRecord(emp: IEmployee): Observable<IEmployee> {
    let body = JSON.stringify({ employee: emp });
    return this._http.post<any>(this._url + "create", body, httpOptions);
  }

  submitAndSendEmployeeRecord(emp: IEmployee): Observable<IEmployee> {
    let body = JSON.stringify({ employee: emp });
    return this._http.post<any>(
      this._url + "create_and_send",
      body,
      httpOptions
    );
  }

  sendUnsyncEmployeeRecord(): Observable<IEmployee> {
    let body = JSON.stringify({});
    return this._http.post<any>(
      this._url + "sync_all_unuploaded",
      body,
      httpOptions
    );
  }
}
