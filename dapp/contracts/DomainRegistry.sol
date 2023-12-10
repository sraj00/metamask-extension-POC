// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";


contract DomainRegistry is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    struct Addresses{
        address owner;
        address[] addresses;
    }

    address public admin;
    string public txtRecord;
    bytes32 private jobId;
    uint256 private fee;

    // Mapping to store domain addresses
    mapping (string => Addresses) registry;
    mapping(bytes32 => string) private requestToDomain;
    mapping(string => address) private pendingRegistrations;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDomainOwner(string memory domain) {
        require(registry[domain].owner == address(0) || registry[domain].owner == msg.sender, "Only domain owner can perform this action");
        _;
    }

    constructor() ConfirmedOwner(msg.sender) {
        admin = msg.sender;
        setChainlinkToken(0x6D0F8D488B669aa9BA2D0f0b7B75a88bf5051CD3);
        setChainlinkOracle(0xeE1A1AF4e004AEC46cbF329015634E7A982E405e);
        jobId = "7da2702f37fd48e5b1b9a5715e3509b6";
        fee = (1 * LINK_DIVISIBILITY) / 10;
    }

    // Function to add a mapping between a domain and contract address
    function addMapping(string memory domain, address contractAddress) external onlyDomainOwner(domain) {
        require(contractAddress != address(0), "Invalid contract address");
        require(msg.sender != address(0), "Invalid sender address");
        require(bytes(domain).length > 0, "Invalid domain name");

        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillDNSVerification.selector);
        req.add('get', 'https://dns.google.com/resolve?name=${domain}&type=TXT');
        req.add('path', 'Answer,-1,data');
        
        bytes32 requestId = sendChainlinkRequest(req, fee);
        requestToDomain[requestId] = domain;
        pendingRegistrations[domain] = msg.sender;
    }

        // New function to handle Chainlink callback
    function fulfillDNSVerification(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
        string memory domain = requestToDomain[requestId];
        address user = pendingRegistrations[domain];

        // DNS Verification logic...
        // If successful, finalize registration
        //if (true){
        //    registry[domain].owner = user;
        //    registry[domain].addresses.push(contractAddress);
        //}

        // Clean up
        delete requestToDomain[requestId];
        delete pendingRegistrations[domain];
    }

    // Function to remove a mapping between a domain and contract address
    function removeMapping(string memory domain, address contractAddress) external onlyDomainOwner(domain) {
        for(uint i = 0; i < registry[domain].addresses.length; i++){
            if(registry[domain].addresses[i] == contractAddress){
                delete registry[domain].addresses[i];
            }
        }
    }

    // Function to get all contract addresses associated with a domain
    function getMapping(string memory domain) external view returns(address[] memory){
        return registry[domain].addresses;
    }

    // Function to delete an unwanted entry if it was maliciously registered
    function deleteDomain(string memory domain) external onlyAdmin {
        delete registry[domain];
    }
}
