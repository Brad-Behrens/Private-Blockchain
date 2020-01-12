// Import block class.
const BlockClass = require('./block.js');
const BlockchainClass = require('./blockchain.js');

// Instantiate blockchain.
let blockchainTest = new BlockchainClass.Blockchain();

// Test adding block to blockchain (successful).
console.log(blockchainTest.chain);
const block1 = new BlockClass.Block('Block data 1');
const block2 = new BlockClass.Block('Block data 2')
blockchainTest._addBlock(block1);
blockchainTest._addBlock(block2);
console.log(blockchainTest.chain);

// Test getting block by hash (successful).
const block1Hash = blockchainTest.chain[1].hash.toString();
console.log(blockchainTest.getBlockByHash(block1Hash));

// Test getting block by height (successful).
const block1height = blockchainTest.chain[1].height;
console.log(blockchainTest.getBlockByHeight(block1height));

// Test validating blockchain function (successful).
console.log(blockchainTest.validateChain());