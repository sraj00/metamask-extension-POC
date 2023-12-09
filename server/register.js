window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        startApp();
    } else {
        console.log('Please install MetaMask!');
    }
});

document.getElementById('addMappingButton').addEventListener('click', async () => {
    const domain = document.getElementById('domain').value;
    const contractAddress = document.getElementById('contractAddress').value;

    if (!domain || !contractAddress) {
        return alert('Please enter both domain and contract address.');
    }

    const contractABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" }, { "internalType": "address", "name": "contractAddress", "type": "address" } ], "name": "addMapping", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "admin", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" } ], "name": "deleteDomain", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" } ], "name": "getMapping", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "domain", "type": "string" }, { "internalType": "address", "name": "contractAddress", "type": "address" } ], "name": "removeMapping", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
    const registryAddress = '0x2dc7b6880fcbf6b43793793064f5d2e5c7452cfd';

    const contract = new web3.eth.Contract(contractABI, registryAddress);

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        await contract.methods.addMapping(domain, contractAddress).send({ from: account });

        alert('Mapping added successfully!');
    } catch (error) {
        console.error(error);
        alert('An error occurred!');
    }
});
