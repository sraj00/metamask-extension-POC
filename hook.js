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
