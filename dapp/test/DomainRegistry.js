const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('DomainRegistry', (accounts) => {
  let DomainRegistry;
  let domainRegistry;
  const domain = 'example.com';
  let contractAddresses = [];

  function generateRandomAddress() {
    const characters = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
        address += characters[Math.floor(Math.random() * characters.length)];
    }
    return address;
  }

  beforeEach(async () => {
    DomainRegistry = await ethers.getContractFactory("DomainRegistry");
    domainRegistry = await DomainRegistry.deploy();
    await domainRegistry.deployed();
    for(let i = 0; i < 5; i++) {
      contractAddresses.push(generateRandomAddress());
    }
  });

  it("Should add mapping", async function () {
    await domainRegistry.addMapping(domain, contractAddresses[0]);
    await domainRegistry.addMapping(domain, contractAddresses[1]);
    let result = await domainRegistry.getMapping(domain);
    result = result.map(r => r.toLowerCase());
    expect(result).to.be.an('array').that.includes(contractAddresses[0]);
    expect(result).to.be.an('array').that.includes(contractAddresses[1]);
  });

  it("Should remove mapping", async function () {
    await domainRegistry.addMapping(domain, contractAddresses[0]);
    await domainRegistry.addMapping(domain, contractAddresses[1]);
    await domainRegistry.removeMapping(domain, contractAddresses[0]);
    let result = await domainRegistry.getMapping(domain);
    result = result.map(r => r.toLowerCase());
    expect(result).to.not.include(contractAddresses[0]);
    expect(result).to.include(contractAddresses[1]);
    await domainRegistry.removeMapping(domain, contractAddresses[1]);
    result = await domainRegistry.getMapping(domain);
    result = result.map(r => r.toLowerCase());
    expect(result).to.not.include(contractAddresses[1]);
  });
});