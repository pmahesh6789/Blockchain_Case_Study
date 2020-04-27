
var express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
var app = express();


const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(data, isSync = false, previousHash = "") {
    this.data = data;
    this.isSync = isSync;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    // console.log("Block - " + JSON.stringify(this, null, 4));
  }

  calculateHash() {
    return SHA256(
      JSON.stringify(this.data).toString() + this.previousHash
    ).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.chain.push(this.createGenericBlock());
  }

  createGenericBlock() {
    return new Block({}, "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBLock(block) {
    block.previousHash = this.getLatestBlock().hash;
    block.hash = block.calculateHash();
    this.chain.push(block);
  }

  isChainValid() {
    let chainLength = this.chain.length || 0;
    for (let count = 1; count < chainLength; count++) {
      const cutrrentBlock = this.chain[count];
      const previousBlock = this.chain[count - 1];
      if (cutrrentBlock.hash != cutrrentBlock.calculateHash()) {
        return false;
      }
      if (cutrrentBlock.previousHash != previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

let empBlockchainList = new Blockchain();
empBlockchainList.addBLock(
  new Block({ empId: 1001, empName: "Mahesh", empAge: 24, empSalary: 20000 }, true)
);
empBlockchainList.addBLock(
  new Block({ empId: 1002, empName: "Ramesh", empAge: 32, empSalary: 24000 }, true)
);
empBlockchainList.addBLock(
  new Block({ empId: 1003, empName: "Suresh", empAge: 28, empSalary: 32000 }, true)
);
console.log("********************************************************");
console.log(
  "Default employee list chain = " + JSON.stringify(empBlockchainList, null, 4)
);
console.log(
  "Is default employee list chain valid? " + empBlockchainList.isChainValid()
);
console.log("********************************************************");

var empListStore = [
        {
            "empId": 1001,
            "empName": "Mahesh",
            "empAge": 24,
            "empSalary": 20000
        },
        {
            "empId": 1002,
            "empName": "Ramesh",
            "empAge": 32,
            "empSalary": 24000
        },
        {
            "empId": 1003,
            "empName": "Suresh",
            "empAge": 28,
            "empSalary": 32000
        }];

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());

app.get("/process_get", function (req, res) {
  // Prepare output in JSON format
  response = {
    first_name: req.query.first_name,
    last_name: req.query.last_name,
  };
  console.log(response);
  const getApi = async () => {
    const server_receiver_url = "http://127.0.0.1:8002/server_hit";
    const serverResp = await fetch(server_receiver_url);
    const json = await serverResp.json();
    console.log("Server Response => " + JSON.stringify(json, null, 4));
  }
  getApi();
  res.end(JSON.stringify(response));
});

// Create employee without sending to other server.
app.post("/create", function (req, res) {
  console.log(
    "*********************** API CREATE PROCESS START *********************************"
  );
  console.log("Is employee list chain valid before add: " + empBlockchainList.isChainValid());
  empBlockchainList.addBLock(new Block(req.body.employee, false));
  console.log("Updated employee block chain : " + JSON.stringify(empBlockchainList, null, 4));
  console.log(
    "Is employee list chain valid after add: " +
      empBlockchainList.isChainValid()
  );
  const emp = Object.assign({}, req.body.employee);
  emp.isSync = false;
  console.log("API: 'create' Response: " + JSON.stringify(emp, null, 4));
  console.log(
    "************************ API CREATE PROCESS END ********************************"
  );
  res.end(JSON.stringify(emp));
});

// Create & send employee record to other server.
app.post("/create_and_send", function (req, res) {
  console.log("******************* API CREATE & SEND UNSYNC RECORDS START *************************************");
  
  console.log(
    "Is employee list chain valid before create & send: " +
      empBlockchainList.isChainValid()
  );
  // Add new record if chain is valid.
  if (empBlockchainList.isChainValid()){
   empBlockchainList.addBLock(new Block(req.body.employee, false));
  }
  console.log(
    "Updated employee block chain before sync: " +
      JSON.stringify(empBlockchainList, null, 4)
  );
  
  const getApi = async () => {
    const server_receiver_url = "http://127.0.0.1:8002/update_all";
    // collect unsync records
    const unsyncEmpList = new Blockchain();
    empBlockchainList.chain.forEach((emp, index) => {
      if (!emp.isSync) {
        // const empItem = Object.assign({}, emp);
        let newEmpItem = new Block(emp.data, false);
        unsyncEmpList.addBLock(newEmpItem);
      }
    });

    console.log("Send unsync employees list - " + JSON.stringify(unsyncEmpList, null, 4));
    const options = {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(unsyncEmpList),
    };
    console.log(
      "Request '" + server_receiver_url  + "' : " + JSON.stringify(options)
    );
    const serverResp = await fetch(server_receiver_url, options);
    console.log("Server response - " + JSON.stringify(serverResp, null, 4));
    const syncListResponse = await serverResp.json();
    console.log(
      "Server Response => " + JSON.stringify(syncListResponse, null, 4)
    );
    
    const respChainLength =
      syncListResponse.chain && syncListResponse.chain.length
        ? syncListResponse.chain.length
        : 0;
    if (respChainLength) {
      syncListResponse.chain.forEach((employee, index) => {
        if (index > 0) {
          empBlockchainList.chain.forEach((emp, index) => {
            if (emp.data.empId == employee.data.empId) {
              emp.isSync = employee.isSync;
            }
          });
        }
      });
    }

    console.log(
      "Is employee list chain valid after create & send processed: " +
        empBlockchainList.isChainValid()
    );
    console.log(
      "Updated employee list chain : " +
        JSON.stringify(empBlockchainList, null, 4)
    );
    // res.end(JSON.stringify(req.body.employee));


    const empList = [];
    empBlockchainList.chain.forEach((employee, index) => {
      if (index > 0) {
        let emp = Object.assign({}, employee.data);
        emp.isSync = employee.isSync;
        empList.push(emp);
      }
    });
    console.log("API: 'create & send' Response: " + JSON.stringify(empList, null, 4));
    console.log(
      "******************* API CREATE & SEND UNSYNC RECORDS END *************************************"
    );
    res.end(JSON.stringify(empList));
  };
  getApi();
});

// Create & send employee record to other server.
app.post("/sync_all_unuploaded", function (req, res) {
  console.log(
    "******************* API SEND UNSYNC RECORDS START *************************************"
  );
  console.log(
    "Is employee list chain valid before aync all unuploaded: " +
      empBlockchainList.isChainValid()
  );

  const getApi = async () => {
    const server_receiver_url = "http://127.0.0.1:8002/update_all";
    // collect unsync records
    const unsyncEmpList = new Blockchain();
    empBlockchainList.chain.forEach((emp, index) => {
      if (!emp.isSync) {
        // const empItem = Object.assign({}, emp);
        let newEmpItem = new Block(emp.data, false);
        unsyncEmpList.addBLock(newEmpItem);
      }
    });
    console.log(
      "Send unsync employees list - " + JSON.stringify(unsyncEmpList, null, 4)
    );
    // const serverResp = await fetch(server_receiver_url);
    const options = {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(unsyncEmpList),
    };
    console.log(
      "Request '" + server_receiver_url + "' : " + JSON.stringify(options)
    );
    const serverResp = await fetch(server_receiver_url, options);
    const syncListResponse = await serverResp.json();
    console.log(
      "Server Response => " + JSON.stringify(syncListResponse, null, 4)
    );
    
    const respChainLength = syncListResponse.chain && syncListResponse.chain.length ? syncListResponse.chain.length : 0;
    if (respChainLength){
        const empList = [];
        syncListResponse.chain.forEach((employee, index) => {
          if (index > 0) {
             empBlockchainList.chain.forEach((emp, index) => {
               if(emp.data.empId == employee.data.empId){
                 emp.isSync = employee.isSync;
               }
             });
          }
       });
    }

    console.log(
      "Is employee list chain valid after unsync processed: " +
        empBlockchainList.isChainValid()
    );
    // res.end(JSON.stringify(req.body.employee));

    const empList = [];
    empBlockchainList.chain.forEach((employee, index) => {
      if (index > 0) {
        let emp = Object.assign({}, employee.data);
        emp.isSync = employee.isSync;
        empList.push(emp);
      }
    });
    console.log(
      "API: 'unsync all records' Response: " + JSON.stringify(empList, null, 4)
    );
    console.log(
      "******************* API SEND UNSYNC RECORDS END *************************************"
    );
    res.end(JSON.stringify(empList));
  };
  getApi();
});

// Get all list of employees.
app.get("/emplist", function (req, res) {
  const empList = [];
  empBlockchainList.chain.forEach((employee, index) => {
    if (index > 0) {
      let emp = Object.assign({}, employee.data);
      emp.isSync = employee.isSync;
      empList.push(emp);
    }
  });
  console.log("*********************** API EMPLIST PROCESSING START *********************************");
  console.log("Is employee list chain valid: " + empBlockchainList.isChainValid());
  console.log("API: 'emplist' Response: " + JSON.stringify(empList, null, 4));
  console.log(
    "************************ API EMPLIST PROCESSING END ********************************"
  );
  res.end(JSON.stringify(empList));
});

app.get("/fetchAll", function (req, res) {
  console.log("Server 1 Hits...");
  const emp = {
    empId: 1004,
    empName: "Mahesh Test",
    empAge: 42,
    empSalary: 60000,
  };
  empListStore.push(emp);
  res.end(JSON.stringify(empListStore));
});


var server = app.listen(8001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});