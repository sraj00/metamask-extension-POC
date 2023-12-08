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
    accounts = await ethers.getSigners();
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

  it("Should delete domain mapping", async function () {
    await domainRegistry.addMapping(domain, contractAddresses[0]);
    await domainRegistry.addMapping(domain, contractAddresses[1]);

    await domainRegistry.deleteDomain(domain);
    let result = await domainRegistry.getMapping(domain);
    expect(result).to.be.an('array').that.is.empty;
  });

  it("Should not delete domain mapping if domain does not exist", async function () {
    const nonExistentDomain = 'nonexistent.com';

    await domainRegistry.addMapping(domain, contractAddresses[0]);
    await domainRegistry.addMapping(domain, contractAddresses[1]);

    await domainRegistry.deleteDomain(nonExistentDomain);
    let result = await domainRegistry.getMapping(domain);
    result = result.map(r => r.toLowerCase());
    expect(result).to.be.an('array').that.includes(contractAddresses[0]);
    expect(result).to.be.an('array').that.includes(contractAddresses[1]);
  });

  it("Should revert when adding mapping if not called by the owner", async function () {
    const [owner, nonOwner] = accounts;
    
    await domainRegistry.addMapping(domain, contractAddresses[0]);
    await expect(
        domainRegistry.connect(nonOwner).addMapping(domain, contractAddresses[0])
    ).to.be.revertedWith("Only domain owner can perform this action");
  });

  it("Should revert when removing mapping if not called by the owner", async function () {
    const [owner, nonOwner] = accounts;

    await domainRegistry.addMapping(domain, contractAddresses[0]);
    await expect(
        domainRegistry.connect(nonOwner).removeMapping(domain, contractAddresses[0])
    ).to.be.revertedWith("Only domain owner can perform this action");
  });

  it("Should revert when deleting domain mapping if not called by the owner", async function () {
    const [owner, nonOwner] = accounts;

    await domainRegistry.addMapping(domain, contractAddresses[0]);

    await expect(
        domainRegistry.connect(nonOwner).deleteDomain(domain)
    ).to.be.revertedWith("Only admin can perform this action");
  });
});