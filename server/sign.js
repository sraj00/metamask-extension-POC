window.addEventListener('load', () => {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
    } else {
        console.log('Please install MetaMask!');
    }
});

document.getElementById("personal_sign").addEventListener("submit", function(event) {
    event.preventDefault();
    validateSign();
});

async function validateSign() {
    let messageElement = document.getElementById('textToHash');
    let signerAddressElement = document.getElementById('signerAddress');
    let message = messageElement ? messageElement.value : '';
    let signerAddress = signerAddressElement ? signerAddressElement.value : '';

    if (!message || !signerAddress) {
        return alert('Please enter both text and signer address.');
    }

    const formattedMessage = web3.utils.utf8ToHex(message);

    try {
        let signature = await doPersonalSign(formattedMessage, signerAddress);
        let signatureResultElement = document.getElementById('signatureResult');
        if (signatureResultElement) {
            signatureResultElement.innerText = 'Signature: ' + signature + '\nHash: ' + formattedMessage + '\nAddress: ' + signerAddress + '\n\n\n Add this to the txt record of your domain: verify-domain=' + signature;
        }

        const recoveredAddress = await web3.eth.accounts.recover(message, signature);
        console.log('final - ' + recoveredAddress);
        if (signerAddress === recoveredAddress) {
            console.log('Signature verified final');
        } else {
            console.log('Signature verification failed');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred!');
    }
}

function doPersonalSign(formattedMessage, from) {
    return new Promise((resolve, reject) => {
        web3.eth.personal.sign(formattedMessage, from, '')
            .then(result => {
                console.log("Signed: " + result);
                resolve(result);
            })
            .catch(error => {
                console.error('Error while signing:', error);
                reject(error);
            });
    });
}