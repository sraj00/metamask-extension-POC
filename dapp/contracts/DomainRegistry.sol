// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract DomainRegistry{
    struct Addresses{
        address owner;
        address[] addresses;
    }

    address public admin;

    // Mapping to store domain addresses
    mapping (string => Addresses) registry;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDomainOwner(string memory domain) {
        require(registry[domain].owner == address(0) || registry[domain].owner == msg.sender, "Only domain owner can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Function to add a mapping between a domain and contract address
    function addMapping(string memory domain, address contractAddress) external onlyDomainOwner(domain) {
        require(contractAddress != address(0), "Invalid contract address");
        require(msg.sender != address(0), "Invalid sender address");
        require(bytes(domain).length > 0, "Invalid domain name");

        if (registry[domain].owner == address(0)) {
            registry[domain].owner = msg.sender;
        }
        registry[domain].addresses.push(contractAddress);
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

        // Event to log fallback calls
    event FallbackCalled(address caller, uint amount, bytes data);

    // Fallback function
    fallback() external payable {
        // Emit an event to log fallback function call
        emit FallbackCalled(msg.sender, msg.value, msg.data);
    }

    // Optional: Receive function for handling plain Ether transfers
    receive() external payable {
        // Emit event to log Ether received
        emit FallbackCalled(msg.sender, msg.value, "");
    }
}
