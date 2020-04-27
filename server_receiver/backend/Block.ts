
// const SHA256 = require("crypto-js/sha256");

import SHA256 from 'crypto-js/sha256';

export default class Block {
  data: object;
  previousHash: string;
  hash: string;
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
