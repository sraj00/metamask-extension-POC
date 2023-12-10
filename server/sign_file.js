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
    let fileElement = document.getElementById('fileToSign');
    let signerAddressElement = document.getElementById('signerAddress');
    let signerAddress = signerAddressElement ? signerAddressElement.value : '';

    if (!fileElement.files.length || !signerAddress) {
        return alert('Please select a file and enter the signer address.');
    }

    const file = fileElement.files[0];
    const reader = new FileReader();
    reader.onload = async function(e) {
        const text = e.target.result;
        const formattedMessage = web3.utils.utf8ToHex(text);

        try {
            let signature = await doPersonalSign(formattedMessage, signerAddress);
            let signatureResultElement = document.getElementById('signatureResult');
            if (signatureResultElement) {
                signatureResultElement.innerText = 'Signature: ' + signature + '\nHash: ' + formattedMessage + '\nAddress: ' + signerAddress + '\n\n\n Add this to the txt record of your domain: verify-domain=' + signature;
            }

            const recoveredAddress = await web3.eth.accounts.recover(text, signature);
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
    };

    reader.readAsText(file);
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
