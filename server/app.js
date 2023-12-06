window.addEventListener('load', function() {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
    } else {
        console.log('MetaMask not detected');
    }

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

    const sendButton = document.getElementById('sendButton');
    sendButton.addEventListener('click', () => {
        const address = document.getElementById('address').value;
        const amount = document.getElementById('amount').value;
        sendEther(address, amount);
    });
});

function sendEther(address, amount) {
    web3.eth.getAccounts().then(accounts => {
        const sender = accounts[0];
        const weiAmount = web3.utils.toWei(amount, 'ether');
        web3.eth.sendTransaction({
            from: sender,
            to: address,
            value: weiAmount
        }).then(tx => {
            console.log('Transaction:', tx);
        }).catch(error => {
            console.error(error);
        });
    });
}
