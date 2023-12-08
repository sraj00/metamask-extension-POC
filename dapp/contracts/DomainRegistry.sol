// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract DomainRegistry{
    struct Addresses{
        address[] addresses;
    }
    // Addresses private addressVar;
    mapping (string => Addresses) registry;

    function addMapping(string memory domain, address contractAddress) external{
        registry[domain].addresses.push(contractAddress);
    }

    function removeMapping(string memory domain, address contractAddress) external {
        for(uint i = 0; i < registry[domain].addresses.length; i++){
            if(registry[domain].addresses[i] == contractAddress){
                delete registry[domain].addresses[i];
            }
        }
    }

    function getMapping(string memory domain) external view returns(address[] memory){
        return registry[domain].addresses;
    }
}
