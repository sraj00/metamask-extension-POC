browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addWebRequestListener") {
      // Set up your webRequest listener here
      browser.webRequest.onBeforeRequest.addListener(
          // Your listener logic
          { /* listener details */ },
          { urls: ["<all_urls>"], types: ["script"] },
          ["blocking"]
      );

      // Respond back if necessary
      sendResponse({ status: "Listener added" });
  }
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

  async function fetchCodeSignatures(domain) {
    const signaturesMap = new Map();
    try {
        const response = await fetch('https://' + domain + '/codesigs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        for (const entry of jsonData) {
          console.log('Entry:', entry);
          for (const [filePath, signature] of Object.entries(entry)) {
              console.log(`File Path: ${filePath}, Signature: ${signature}`);
              signaturesMap.set(filePath, signature);
              // Add any additional processing for each file path and signature here
          }
        }
        return signaturesMap;
    } catch (error) {
        console.error('Error fetching code signatures:', error);
        return null;
    }
    return signaturesMap;
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
                  const signs = fetchCodeSignatures(domain);
                //   console.log('Code signatures:', codeSignatures);
                //   codeSignatures.forEach((signature, filePath) => {
                //     console.log(`Processing file: ${filePath} with signature: ${signature}`);
                //     // Additional processing here
                // });
                  const codeSignatures = ""
                  injectScript(domain, verificationCode, codeSignatures); // Call injectScript with the verification code
              }
          } else {
            this.alert("No signature TXT record found for this domain. Verification failed.");
          }
      })
      .catch(error => console.error('Error:', error));

});


// This function will be injected into the page to access the Web3 provider
function injectScript(domain, verificationCode, codeSignatures) {
  const scriptContent = `
    (function() {
        const verificationCode = "${verificationCode}";
        const domain = "${domain}";
        const codeSignatures = "${codeSignatures}";
        console.log('Code signatures:', codeSignatures);
        console.log('Verification code:', verificationCode);
        console.log('Domain:', domain);
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
                          console.log('Signature verified. All looks good');
                          alert('DNS & Code Signature verified. All looks good');
                      } else {
                          console.log('Signature verification failed');
                          alert('Signature verification failed');
                      }
                } catch (error) {
                    console.error('Error fetching domain mappings:', error);
                }
            })();

            async function fetchAndValidateCodeSignatures(codeSignatures, domain) {
              for (const entry of codeSignatures) {
                  for (const [filePath, expectedSignature] of Object.entries(entry)) {
                      console.log('Fetching content for: ' + filePath);

                      try {
                          const response = await fetch('https://' + domain + '/' + filePath);
                          if (!response.ok) {
                              console.log('HTTP error! Status:');
                          }
                          const fileContent = await response.text();

                          // Validate the signature
                          const recoveredAddress = await validateSignature(filePath, fileContent, expectedSignature);
                          console.log('Recovered address:', recoveredAddress);
                          if (!recoveredAddress) {
                              console.error('Signature validation failed for', filePath);
                          } else {
                              console.log('Signature verified for', filePath);
                          }
                      } catch (error) {
                          console.error('Error fetching or validating signature for', filePath, ':', error);
                      }
                  }
              }
          }

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

          // fetchAndValidateCodeSignatures(codeSignatures, domain);
          async function validateSignature(filePath, fileContent, expectedSignature) {
            const formattedMessage = web3.utils.utf8ToHex(fileContent);

            try {
                const recoveredAddress = await web3.eth.accounts.recover(formattedMessage, expectedSignature);
                return recoveredAddress;
            } catch (error) {
                console.error('Error validating signature:', error);
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

