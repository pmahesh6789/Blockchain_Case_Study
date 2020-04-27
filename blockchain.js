
const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(data, previousHash = ''){
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        // console.log("Block - " + JSON.stringify(this, null, 4));
    }

    calculateHash(){
        return SHA256(JSON.stringify(this.data).toString() + this.previousHash).toString();
    }
}

class Blockchain {
    constructor(){
        this.chain = [];
        this.chain.push(this.createGenericBlock());
    }

    createGenericBlock(){
        return new Block({}, "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBLock(block){
        block.previousHash = this.getLatestBlock().hash;
        block.hash = block.calculateHash();
        this.chain.push(block);
    }

    isChainValid(){
        let chainLength = this.chain.length || 0;
        for(let count = 1; count < chainLength; count++){
            const cutrrentBlock = this.chain[count];
            const previousBlock = this.chain[count - 1];
            if(cutrrentBlock.hash != cutrrentBlock.calculateHash()){
                return false;
            }
            if(cutrrentBlock.previousHash != previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

let empList = new Blockchain();
empList.addBLock(
  new Block({ empId: 1001, empName: "Mahesh", empAge: 24, empSalary: 20000 })
);
empList.addBLock(
  new Block({ empId: 1002, empName: "Ramesh", empAge: 32, empSalary: 24000 })
);
empList.addBLock(
  new Block({ empId: 1003, empName: "Suresh", empAge: 28, empSalary: 32000 })
);

console.log("Latest block chain = " + JSON.stringify(empList, null, 4));
console.log("Is block chain valid? " + empList.isChainValid());

empList.chain[1].data.empName = "Changed name";
console.log("Latest block chain = " + JSON.stringify(empList, null, 4));
console.log("Is block chain valid? " + empList.isChainValid());