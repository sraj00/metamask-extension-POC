var originalSend = web3.eth.sendTransaction;

web3.eth.sendTransaction = function() {
    var stack = new Error().stack;
    var stackLines = stack.split("\n");

    var relevantStackLines = stackLines.slice(2);

    var formattedLines = relevantStackLines.map(function(line) {
        return line.trim().replace(/^at\s+/gm, '');
    });

    originalSend.apply(console, ["Stack trace:"]);
    formattedLines.forEach(function(line) {
        originalSend.apply(console, [line]);
    });

    originalSend.apply(console, arguments);
};
