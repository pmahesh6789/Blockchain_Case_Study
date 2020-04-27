
var express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
var http = require("http");
const sockjs = require("sockjs");
var app = express();

const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(data, previousHash = "") {
    this.data = data;
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
  new Block({ empId: 1001, empName: "Mahesh", empAge: 24, empSalary: 20000 })
);
empBlockchainList.addBLock(
  new Block({ empId: 1002, empName: "Ramesh", empAge: 32, empSalary: 24000 })
);
empBlockchainList.addBLock(
  new Block({ empId: 1003, empName: "Suresh", empAge: 28, empSalary: 32000 })
);

console.log(
  "Latest block chain = " + JSON.stringify(empBlockchainList, null, 4)
);
console.log("Is block chain valid? " + empBlockchainList.isChainValid());

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

const echo = sockjs.createServer();

function sendData(conn) {
  const empList = [];
  empBlockchainList.chain.forEach((employee, index) => {
    if (index > 0) {
      let emp = Object.assign({}, employee.data);
      empList.push(emp);
    }
  });
  conn.write(JSON.stringify(empList));
}

var connection = null;
echo.on("connection", function (conn) {
  conn.on("data", function (message) {
    // conn.write(message);
    console.log("Message - " + message);
    if (message == "fetchAll"){
        const fetchAllFromServer = async () => {
          const server_receiver_url = "http://127.0.0.1:8001/fetchAll";
          const serverResp = await fetch(server_receiver_url);
          const json = await serverResp.json();
          console.log("Server Response => " + JSON.stringify(json, null, 4));
          const emp = {
            empId: 1004,
            empName: "Mahesh Test",
            empAge: 42,
            empSalary: 60000,
          };
          // empList.push(emp);
          if (connection) {
            sendData(connection);
          }
        };
        fetchAllFromServer();
    }else{
      sendData(conn);
    } 
  });
  conn.on("close", function () {});
  connection = conn;
});



app.post("/update_all", function (req, res) {
  console.log("**************** Server 2 : update_all API START *******************************");
  console.log(
    "Is employee list chain valid before process: " +
      empBlockchainList.isChainValid()
  );
  console.log("Received employee list - " + JSON.stringify(req.body, null, 4));
  const receivedList = req.body;
  let chainLength = receivedList.chain.length || 0;
  for (let count = 1; count < chainLength; count++) {
    const cutrrentBlock = receivedList.chain[count];
    const previousBlock = receivedList.chain[count - 1];

    let empNewBlock = new Block({
      empId: receivedList.chain[count].data.empId,
      empName: receivedList.chain[count].data.empName,
      empAge: receivedList.chain[count].data.empAge,
      empSalary: receivedList.chain[count].data.empSalary,
    });
    empNewBlock.previousHash = previousBlock.hash;

    console.log("empNewBlock - " + JSON.stringify(empNewBlock, null, 4));

    let isValidRecord = true;
    if (cutrrentBlock.hash != empNewBlock.calculateHash()) {
      isValidRecord = false;
    }
    if (cutrrentBlock.previousHash != previousBlock.hash) {
      isValidRecord = false;
    }
    console.log("Count - " + count + " BLock - " + JSON.stringify(empNewBlock, null, 4));
    if(isValidRecord){
       empBlockchainList.addBLock(empNewBlock);
       receivedList.chain[count].isSync = true;
    }else{
       receivedList.chain[count].isSync = false;
    }
  }

  // console.log("connection - " + connection);
  console.log(
    "Is employee list chain valid after process: " +
      empBlockchainList.isChainValid()
  );
  console.log("Records update details - " + JSON.stringify(receivedList, null, 4));
  if(connection){
    sendData(connection);
  }
  console.log(
    "**************** Server 2 : update_all API END *******************************"
  );
  res.end(JSON.stringify(receivedList));
});


var server = app.listen(8002, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});

// var server = http.createServer();
echo.installHandlers(server, { prefix: "/echo" });
// echo.attach(server);
// server.listen(9999, "0.0.0.0");