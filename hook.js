var originalSend = web3.eth.sendTransaction;

web3.eth.sendTransaction = function() {
    console.log("Intercepted web3.eth.sendTransaction call");
    var stack = new Error().stack;
    console.log(stack);

    return originalSend.apply(this, arguments);
};
