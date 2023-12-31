//var originalSend = web3.eth.sendTransaction;
//
//web3.eth.sendTransaction = function() {
//    var stack = new Error().stack;
//    var stackLines = stack.split("\n");
//
//    var relevantStackLines = stackLines.slice(2);
//
//    var formattedLines = relevantStackLines.map(function(line) {
//        return line.trim().replace(/^at\s+/gm, '');
//    });
//
//    console.log("Stack trace:");
//    formattedLines.forEach(function(line) {
//        console.log(line);
//    });
//
//    originalSend.apply(web3.eth, arguments);
//};

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const ABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" }, { "internalType": "address", "name": "contractAddress", "type": "address" } ], "name": "addMapping", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "admin", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" } ], "name": "deleteDomain", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" } ], "name": "getMapping", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" }, { "internalType": "address", "name": "contractAddress", "type": "address" } ], "name": "removeMapping", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];

// Replace with your contract's deployed address
const contractAddress = '0x2dc7b6880fcbf6b43793793064f5d2e5c7452cfd';

// Create contract instance
const domainRegistryContract = new web3.eth.Contract(ABI, contractAddress);

// Function to call getMapping
async function getDomainMappings(domainName) {
    try {
        const result = await domainRegistryContract.methods.getMapping(domainName).call();
        console.log(`Addresses for domain '${domainName}':`, result);
    } catch (error) {
        console.error('Error fetching domain mappings:', error);
    }
}

// Function to extract the domain from the current URL
function getDomainFromUrl(url) {
    console.log('Extracting domain from URL:', url);
    let hostname;
    // Find & remove protocol (http, ftp, etc.) and get the hostname
    if (url.indexOf("//") > -1) {
	hostname = url.split('/')[2];
    }
    else {
	hostname = url.split('/')[0];
    }
    // Find & remove port number
    hostname = hostname.split(':')[0];
    // Find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}

const domainName = getDomainFromUrl(window.location.href);
getDomainMappings(domainName);

// Get TXT record
let txt = "";
fetch('https://dns.google.com/resolve?name=shubhamraj.com&type=TXT')
    .then(response => response.json())
    .then(data => {
        if (data.Answer) {
            txt = "";
            data.Answer.forEach(record => {
                txt += record.data + "\n";
            });
            // Update the div here, after the TXT records have been fetched
            document.getElementById('txt').innerText = txt;
        }
    })
    .catch(error => console.error('Error:', error));

async function verifySignature(hash, signature) {
    try {
        const address = await web3.eth.personal.ecRecover(hash, signature);
        return address;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Example usage
const hash = '0x...' // Your hash here
const signature = '...' // Your signature here
const address = await verifySignature(hash, signature);
console.log(address); // This should be the signer's address if the signature is valid
