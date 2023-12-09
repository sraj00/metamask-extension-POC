window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        startApp();
    } else {
        console.log('Please install MetaMask!');
    }
});

function startApp() {
    const transferButton = document.getElementById('transferButton');
    transferButton.addEventListener('click', transferTokens);
}

async function transferTokens() {
    const receiverAddress = document.getElementById('receiverAddress').value;
    const amount = document.getElementById('amount').value;

    if (!receiverAddress || !amount) {
        return alert('Please enter both receiver address and amount.');
    }

    const contractAddress = 'YOUR_CONTRACT_ADDRESS';
    const abi = [/* Your Contract's ABI */];
    const contract = new web3.eth.Contract(abi, contractAddress);

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        const amountToSend = web3.utils.toWei(amount, 'ether'); // Convert to wei value
        await contract.methods.transfer(receiverAddress, amountToSend).send({ from: account });

        alert('Transfer successful!');
    } catch (error) {
        console.error(error);
        alert('An error occurred!');
    }
}
