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

    try {
        const signature = await web3.eth.sign(hexHash, signerAddress);
        document.getElementById('signatureResult').innerText = 'Signature: ' + signature;
    } catch (error) {
        console.error(error);
        alert('An error occurred!');
    }
});
