/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message` 
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *  
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if(this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block 
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to 
     * create the `block hash` and push the block into the chain array. Don't for get 
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention 
     * that this method is a private method. 
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            // Assign block timestamp.
            block.time = new Date().getTime().toString().slice(0,-3);
            // Assign block height.
            block.height = self.chain.length;
            // Assign block previous hash.
            if(self.chain.length > 0) {
                block.previousBlockHash = self.chain[self.chain.length - 1].hash;
            }
            else {
                block.previousBlockHash = null;
            }
            // Hash block to be added to the blockchain.
            block.hash = SHA256(JSON.stringify(block)).toString();
            // Push block onto the blockchain.
            self.chain.push(block);
            self.height += 1;
            // Resolve block or reject if an error occured.
            resolve(block);
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address 
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            let requestMessage =  `${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`;
            resolve(requestMessage);   
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address 
     * @param {*} message 
     * @param {*} signature 
     * @param {*} star 
     */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            // 1 - Get time from the message.
            let messageTime = parseInt(message.split(':')[1]);
            // 2 - Get current time.
            let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));

            // 3 - Check if the message has timed out.
            if((currentTime - messageTime) <= (5*60)) {
                // 4 - Verify message using wallet and digital signature.
                let verifyMessage = bitcoinMessage.verify(message, address, signature);
                if(!verifyMessage) {
                    reject(new Error('Digital signature is invalid.'));
                }
                else {
                    let block = new BlockClass.Block({star});
                    block.owner = address;
                    let addedBlock = await self._addBlock(block);
                    resolve(addedBlock);
                }
            }
            else {
                reject(new Error('Message timed out.'));
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash 
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            // Search chains blocks for specific hash value then resolve.\
            let searchedBlock = self.chain.filter(block => block.hash === hash)[0];
            if(searchedBlock) {
                resolve(searchedBlock);
            }
            else {
                reject(new Error('No block with such hash in chain.'));
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object 
     * with the height equal to the parameter `height`
     * @param {*} height 
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address 
     */
    getStarsByWalletAddress(address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {
            // Search through blockchain for blocks with owners address.
            let ownedBlocks = self.chain.filter(block => block.owner === address);
            if(ownedBlocks === 0) {
                reject(new Error('No stars associated with address.'));
            }
            stars = ownedBlocks.map(block => block.getBData());
            if(stars) {
                resolve(stars);
            }
            else {
                reject(new Error('Stars could not be retrieved.'));
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    async validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            // Validate each block in chain using validateBlock().
            for(let block of self.chain) {
                // Validate each block in the blockchain.
                if(await block.validate()) {
                    // Testing that previous block hash holds in the chain.
                    if(block.height > 0) {
                        // Check the blocks previous hash is equal to the previous blocks hash.
                        let previousBlock = self.chain.filter(b => b.height === block.height - 1)[0];
                        if(block.previousBlockHash !== previousBlock.hash) {
                            errorLog.push(new Error(`Block ${block.height}: Previous block hash isn't equal to the block's previous hash.`));
                        }
                    } 
                }
                else {
                    errorLog.push(new Error(`Block ${block.height}: Block is invalid.`));
                }
            }
            // Resolve error log promise.
            if(errorLog.length > 0) {
                resolve(errorLog);
            }
            else {
                resolve('No errors in chain validation.');
            }
        });
    }
}

module.exports.Blockchain = Blockchain;
