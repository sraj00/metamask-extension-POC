// This script changes the background color of the current page to blue

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  //alert(12);
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



