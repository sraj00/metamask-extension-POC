window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
    } else {
        console.log('Please install MetaMask!');
    }
});

document.getElementById('signButton').addEventListener('click', async () => {
    const textToHash = document.getElementById('textToHash').value;
    const signerAddress = document.getElementById('signerAddress').value;

    if (!textToHash || !signerAddress) {
        return alert('Please enter both text and signer address.');
    }

    const hash = CryptoJS.SHA256(textToHash).toString();
    const hexHash = '0x' + hash;
    console.log(hexHash);

    try {
	const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        // const signature = await web3.eth.sign(hexHash, signerAddress);
        // document.getElementById('signatureResult').innerText = 'Signature: ' + signature + '   hash:' + hexHash + '    address:' + signerAddress;
        const message = "hello";
        const messageHash = web3.utils.sha3(message);
        const signature = await web3.eth.sign(messageHash, signerAddress);
        document.getElementById('signatureResult').innerText = 'Signature: ' + signature + '   hash:' + hexHash + '    address:' + signerAddress;

// To recover the address
const recoveredAddress = await web3.eth.personal.ecRecover(messageHash, signature);
console.log(recoveredAddress + '\n' + messageHash + '\n' + signature);
    } catch (error) {
        console.error(error);
        alert('An error occurred!');
    }
});
