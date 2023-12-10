// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract DomainRegistry is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    struct Addresses{
        address owner;
        address[] addresses;
    }

    struct DomainRequest {
        string domain;
        address contractAddress;
    }

    address public admin;
    string public txtRecord;
    bytes32 private jobId;
    uint256 private fee;

    // Mapping to store domain addresses
    mapping (string => Addresses) public registry;
    mapping(bytes32 => DomainRequest) public requestToDomain;
    mapping(string => address) public pendingRegistrations;

    uint256 private dataIdCounter = 0;
    mapping(uint256 => bytes) public requestData;

    event DNSVerificationFulfilled(bytes32 indexed requestId, bytes message, address user, address contractAddress, bool success, bytes32 ethSignedMessageHash, address recoveredSigner);

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
        jobId = "cd428539aec34449a38cbc45d9a52005";
        fee = (1 * LINK_DIVISIBILITY) / 10;
    }

    // Function to add a mapping between a domain and contract address
    function addMapping(string memory domain, address contractAddress) external onlyDomainOwner(domain) {
        require(contractAddress != address(0), "Invalid contract address");
        require(msg.sender != address(0), "Invalid sender address");
        require(bytes(domain).length > 0, "Invalid domain name");

        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillDNSVerification.selector);
        req.add('get', string(abi.encodePacked('https://dns.google.com/resolve?name=', domain, '&type=TXT')));

        bytes32 requestId = sendChainlinkRequest(req, fee);
        requestToDomain[requestId] = DomainRequest(domain, contractAddress);
        pendingRegistrations[domain] = msg.sender;
    }

    function addMappingAdmin(string memory domain, address contractAddress) external onlyAdmin {
        require(contractAddress != address(0), "Invalid contract address");
        require(msg.sender != address(0), "Invalid sender address");
        require(bytes(domain).length > 0, "Invalid domain name");
        if (registry[domain].owner == address(0)) {
            registry[domain].owner = msg.sender;
        }
        registry[domain].addresses.push(contractAddress);
    }
        // New function to handle Chainlink callback
    function fulfillDNSVerification(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
        DomainRequest memory domainRequest = requestToDomain[requestId];
        uint256 dataId = dataIdCounter++;
        requestData[dataId] = bytesData;
        string memory domain = domainRequest.domain;
        address contractAddress = domainRequest.contractAddress;
        address user = pendingRegistrations[domain];

        bytes32 ethSignedMessageHash = toEthSignedMessageHash(bytes(domain));
        address recoveredSigner = recoverSigner(domain, bytesData);

        bool success = recoveredSigner == user;
        if (success){
            registry[domain].owner = user;
            registry[domain].addresses.push(contractAddress);
        }

        emit DNSVerificationFulfilled(requestId, bytesData, user, contractAddress, success, ethSignedMessageHash, recoveredSigner);

        // Clean up
        delete requestToDomain[requestId];
        delete pendingRegistrations[domain];
    }

    function toEthSignedMessageHash(bytes memory message) internal pure returns (bytes32) {
        bytes32 hash = keccak256(bytes.concat("\x19Ethereum Signed Message:\n", bytes(Strings.toString(message.length)), message));
        return hash;
    }

    function recoverSigner(string memory _message, bytes memory _sig) public pure returns (address) {
        bytes32 ethSignedMessageHash = toEthSignedMessageHash(bytes(_message));

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }

        if (v < 27) v += 27;
        address recovered = ecrecover(ethSignedMessageHash, v, r, s);
        return recovered;
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
     function getMapping(string memory domain) external view returns (address owner, address[] memory addresses) {
        Addresses storage addr = registry[domain];
        return (addr.owner, addr.addresses);
    }

    // Function to delete an unwanted entry if it was maliciously registered
    function deleteDomain(string memory domain) external onlyAdmin {
        delete registry[domain];
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyAdmin {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}