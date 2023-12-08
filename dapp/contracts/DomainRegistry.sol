// SPDX-License-Identifier
pragma solidity ^0.8.7;

contract DomainRegistry{
    struct Addresses{
        address owner;
        address[] addresses;
    }

    // Mapping to store domain addresses
    mapping (string => Addresses) registry;

    modifier onlyDomainOwner(string memory domain) {
        require(registry[domain].owner == address(0) || registry[domain].owner == msg.sender, "Only domain owner can perform this action");
        _;
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
    function getMapping(string memory domain) external view returns(address[] memory){
        return registry[domain].addresses;
    }
}
