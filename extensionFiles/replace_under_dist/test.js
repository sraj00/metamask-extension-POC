// This script changes the background color of the current page to blue

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  alert(12);
  // Listen for a click event
  document.addEventListener('click', function() {
      // Change the background color of the body element
      document.body.style.backgroundColor = 'blue';
  });
});

window.addEventListener('DOMContentLoaded', function() {
  console.log('Window loaded');

  if (typeof window.ethereum !== 'undefined') {
      console.log('Ethereum wallet detected');
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
  } else {
      console.log('MetaMask not detected');
  }

  // Function to extract the domain from the current URL
  function getDomainFromUrl(url) {
      console.log('Extracting domain from URL:', url);
      let hostname;
      // Find & remove protocol (http, ftp, etc.) and get the hostname
      if (url.indexOf("//") > -1) {
          hostname = url.split('/')[2];
      }
      else {
          hostname = url.split('/')[0];
      }
      // Find & remove port number
      hostname = hostname.split(':')[0];
      // Find & remove "?"
      hostname = hostname.split('?')[0];

      return hostname;
  }

  // Get the domain from the current tab's URL
  const domain = getDomainFromUrl(window.location.href);
  console.log('Domain extracted:', domain);

  // Get TXT record
  let txt = "";
  console.log('Fetching TXT record for domain:', domain);
  console.log('Fetching TXT record for domain:', `https://dns.google.com/resolve?name=${domain}&type=TXT`);
  fetch(`https://dns.google.com/resolve?name=${domain}&type=TXT`)
      .then(response => {
          console.log('Received response:', response);
          return response.json();
      })
      .then(data => {
          console.log('Response data:', data);
          if (data.Answer) {
              txt = "";
              data.Answer.forEach(record => {
                  txt += record.data + "\n";
              });
              console.log('TXT records:', txt);
              // Update the div here, after the TXT records have been fetched
              //document.getElementById('txt').innerText = txt;
          }
      })
      .catch(error => console.error('Error:', error));

  const sendButton = document.getElementById('sendButton');
  sendButton.addEventListener('click', () => {
      console.log('Send button clicked');
      const address = document.getElementById('address').value;
      const amount = document.getElementById('amount').value;
      console.log('Sending Ether to:', address, 'Amount:', amount);
      sendEther(address, amount);
  });
});


// function to call a function named getMapping in the smart contract through infura

// const Web3 = require('web3');

// // Your Infura endpoint
// const infuraEndpoint = 'https://goerli.infura.io/v3/56ca2f79a1ee42cab9f7b4788ab6b0dd';

// // Connect to the Ethereum network
// const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));

// // The ABI for the contract
// const { abi } = JSON.parse(fs.readFileSync("domain.json"));

// // The address of the contract
// const contractAddress = '0x2dc7b6880fcbf6b43793793064f5d2e5c7452cfd';

// // Creating a contract instance
// const contract = new web3.eth.Contract(abi, contractAddress);

// // Calling a function on the contract
// // Replace 'functionName' with the actual function name and add parameters if needed
// contract.methods.addMapping(google.com, 0x2dc7b6880fcbf6b43793793064f5d2e5c7452cfd).call()
// .then(result => {
//     console.log('Function call result:', result);
// })
// .catch(error => {
//     console.error('Error:', error);
// });

//const Web3 = require('web3');

//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// function callSmartContractFunction() {
//   // Check if MetaMask (or another web3 provider) is installed
//   if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
//       // Use MetaMask's provider
//       const web3 = new Web3(window.ethereum || window.web3.currentProvider);

//       // The ABI for the contract
//       const abi = [/* ABI array here */]; // Replace with your contract's ABI

//       // The address of the contract
//       const contractAddress = '0x2dc7b6880fcbf6b43793793064f5d2e5c7452cfd';

//       // Creating a contract instance
//       const contract = new web3.eth.Contract(abi, contractAddress);

//       // Calling a function on the contract
//       // Replace 'functionName' with the actual function name and add parameters if needed
//       contract.methods.addMapping('google.com', '0x2dc7b6880fcbf6b43793793064f5d2e5c7452cfd').call()
//       .then(result => {
//           console.log('Function call result:', result);
//       })
//       .catch(error => {
//           console.error('Error:', error);
//       });
//   } else {
//       console.log('MetaMask is not installed');
//   }
// }

// Call the function when the page loads
// window.addEventListener('DOMContentLoaded', callSmartContractFunction);


// This function will be injected into the page to access the Web3 provider
function injectScript() {
  const scriptContent = `
    (function() {
        if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
            // Use MetaMask's provider
            //const web3 = new Web3(window.ethereum || window.web3.currentProvider);
            const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
            // The ABI for the contract
            const abi = [
              {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
              },
              {
                "inputs": [
                  {
                    "internalType": "string",
                    "name": "domain",
                    "type": "string"
                  },
                  {
                    "internalType": "address",
                    "name": "contractAddress",
                    "type": "address"
                  }
                ],
                "name": "addMapping",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "admin",
                "outputs": [
                  {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "string",
                    "name": "domain",
                    "type": "string"
                  }
                ],
                "name": "deleteDomain",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "string",
                    "name": "domain",
                    "type": "string"
                  }
                ],
                "name": "getMapping",
                "outputs": [
                  {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "string",
                    "name": "domain",
                    "type": "string"
                  },
                  {
                    "internalType": "address",
                    "name": "contractAddress",
                    "type": "address"
                  }
                ],
                "name": "removeMapping",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              }
            ];            // The address of the contract
            const contractAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

            // Creating a contract instance
            const contract = new web3.eth.Contract(abi, contractAddress);

            console.log('Contract instance:', contract);
            console.log('Contract address:', contract.options.address);

            //Example of calling a function on the contract
            contract.methods.addMapping('google.com', '0x5fbdb2315678afecb367f032d93f642f64180aa3').call()
            .then(result => {
                console.log('Function call result:', result);
            })
            .catch(error => {
                console.error('Error:', error);
            });

            // Asynchronous context for calling await inside
            // (async () => {
            //     try {
            //         const result = await contract.methods.getMapping('google.com').call();
            //         console.log('Addresses for domain google.com:', result);
            //     } catch (error) {
            //         console.error('Error fetching domain mappings:', error);
            //     }
            // })();
        } else {
            console.log('MetaMask is not installed');
        }
    })();
  `;

  const script = document.createElement('script');
  script.textContent = scriptContent;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// Inject Web3.js from a CDN
const web3Script = document.createElement('script');
web3Script.src = 'https://cdn.jsdelivr.net/npm/web3/dist/web3.min.js';
web3Script.onload = injectScript; // Inject your script after Web3.js loads
(document.head || document.documentElement).appendChild(web3Script);
console.log("I am here");

// Call the injectScript function when the page loads
window.addEventListener('DOMContentLoaded', () => {
  // Wait for Web3.js to load before calling the function
  if (typeof Web3 !== 'undefined') {
      injectScript();
  }
});