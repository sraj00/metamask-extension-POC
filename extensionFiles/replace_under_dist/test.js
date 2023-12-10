// This script changes the background color of the current page to blue

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
          let verificationCode = null;
          console.log('Response data:', data);
          if (data.Answer) {
              data.Answer.forEach(record => {
                  if (record.data.startsWith('verify-domain=')) {
                      console.log('Verification code found:', record.data);
                      verificationCode = record.data.split('verify-domain=')[1].replace('"', '');
                  }
              });

              if (verificationCode) {
                  console.log('Verification code:', verificationCode);
                  injectScript(domain, verificationCode); // Call injectScript with the verification code
              }
          }
      })
      .catch(error => console.error('Error:', error));

});


// This function will be injected into the page to access the Web3 provider
function injectScript(domain, verificationCode) {
  const scriptContent = `
    (function() {
        const verificationCode = "${verificationCode}";
        const domain = "${domain}";
        if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
            // Use MetaMask's provider
            const web3 = new Web3(window.ethereum || window.web3.currentProvider);
            //const web3 = new Web3(new Web3.providers.HttpProvider("https://base-goerli.g.alchemy.com/v2/KN-qwj6_WPZV1oCPUruFwMW5fkPZ0HLK"));
            // The ABI for the contract
            const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"caller","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"FallbackCalled","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"string","name":"domain","type":"string"},{"internalType":"address","name":"contractAddress","type":"address"}],"name":"addMapping","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"domain","type":"string"}],"name":"deleteDomain","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"domain","type":"string"}],"name":"getMapping","outputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address[]","name":"addresses","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"domain","type":"string"},{"internalType":"address","name":"contractAddress","type":"address"}],"name":"removeMapping","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
            const contractAddress = '0xF54D8074662bc395BE02B77fE42577Dee1970A93';

            // Creating a contract instance
            const contract = new web3.eth.Contract(abi, contractAddress);

            // console.log('Contract instance:', contract);
            // console.log('Contract address:', contract.options.address);

            // Get the domain from the current tab's URL
            (async () => {
                try {
                    const result = await contract.methods.getMapping(domain).call();
                    console.log('Fetching owner and addresses for domain - ' + domain + ': ', result);


                      // Now verify the signature
                      const message = domain;
                      const signature = verificationCode;

                      const address = await verifySignature(message, signature);
                      console.log('Recovered address:', address);

                      if (address === result.owner) {
                          console.log('Signature verified');
                      } else {
                          console.log('Signature verification failed');
                      }
                } catch (error) {
                    console.error('Error fetching domain mappings:', error);
                }
            })();


            // verify the signature
            async function verifySignature(message, signature) {
              try {
                  const address = await web3.eth.accounts.recover(message, signature);
                  return address;
              } catch (error) {
                  console.error('Error verifying signature:', error);
                  return null;
              }
          }

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
// web3Script.onload = injectScript; // Inject your script after Web3.js loads
(document.head || document.documentElement).appendChild(web3Script);
console.log("I am here");

// Call the injectScript function when the page loads
// window.addEventListener('DOMContentLoaded', () => {
//   // Wait for Web3.js to load before calling the function
//   if (typeof Web3 !== 'undefined') {
//       injectScript();
//   }
// });