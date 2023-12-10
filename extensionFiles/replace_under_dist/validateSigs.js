// contentScript.js

// This function fetches the codesigs.json file
async function fetchCodeSignatures() {
    try {
        const response = await fetch('/codesigs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching code signatures:', error);
        return null;
    }
}

// This function validates the signature of a file
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

// Main function to execute the script logic
async function main() {
    const codeSignatures = await fetchCodeSignatures();
    if (!codeSignatures) {
        console.error('Failed to fetch code signatures.');
        return;
    }

    // Add a listener to intercept network requests
    chrome.webRequest.onBeforeRequest.addListener(
        async (details) => {
            const filePath = new URL(details.url).pathname;

            // Check if the file path matches any in codesigs.json
            const signatureEntry = codeSignatures.find(entry => entry[filePath]);
            if (signatureEntry) {
                // Fetch the content of the file
                const response = await fetch(details.url);
                const fileContent = await response.text();

                // Validate the signature
                const expectedSignature = signatureEntry[filePath];
                const recoveredAddress = await validateSignature(filePath, fileContent, expectedSignature);
                console.log(recoveredAddress);
                if (!recoveredAddress) {
                    console.error(`Signature validation failed for ${filePath}`);
                    // Optionally, block the request or take other actions
                } else {
                    console.log(`Signature verified for ${filePath}`);
                }
            }
        },
        { urls: ["<all_urls>"] },
        ["blocking"]
    );
}

// Start the script
main();
