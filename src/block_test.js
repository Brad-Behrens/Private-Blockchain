// Import block class.
const BlockClass = require('./block.js');
const BlockchainClass = require('./blockchain.js');

// Instantiate blockchain.
let blockchainTest = new BlockchainClass.Blockchain();

// Add new Block to the blockchain.
const block1 = new BlockClass.Block('Block data 1');
const block2 = new BlockClass.Block('Block data 2')
blockchainTest._addBlock(block1);
blockchainTest._addBlock(block2);

// Validate Block Test (successful).
console.log(blockchainTest.chain[1]);
console.log(blockchainTest.chain[1].validate());

// Get Block Data Test cases.
// 1 - Genesis Block (successful).
console.log(blockchainTest.chain[0].getBData());
// 2 - Block 1 in chain (successful).
console.log(blockchainTest.chain[1].getBData());


