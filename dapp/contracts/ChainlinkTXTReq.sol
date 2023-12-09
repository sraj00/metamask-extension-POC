// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";


contract APIConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    string public txtRecord;
    bytes32 private jobId;
    uint256 private fee;

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x6D0F8D488B669aa9BA2D0f0b7B75a88bf5051CD3);
        setChainlinkOracle(0xeE1A1AF4e004AEC46cbF329015634E7A982E405e);
        jobId = "7da2702f37fd48e5b1b9a5715e3509b6";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    function request() public {
        Chainlink.Request memory req = buildChainlinkRequest('7da2702f37fd48e5b1b9a5715e3509b6', address(this), this.fulfill.selector);
        req.add(
            'get',
            'https://dns.google.com/resolve?name=shubhamraj.com&type=TXT'
        );
        req.add('path', 'Answer,-1,data');
        sendChainlinkRequest(req, (1 * LINK_DIVISIBILITY) / 10); // 0,1*10**18 LINK 
    }

    function fulfill(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
        txtRecord = string(bytesData);
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
