const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; // The port your app will listen on

app.use(bodyParser.json());

// Middleware to log each request
app.use((req, res, next) => {
    console.log(`Received ${req.method} request on ${req.path}`);
    next();
});

app.post('/', (req, res) => {
    console.log("Request body:", req.body); // Log the request body

    try {
        const data = req.body;
        const answers = data.Answer;
        const verifyDomainRecord = answers.find(answer => answer.data.startsWith("verify-domain="));
        
        if (verifyDomainRecord) {
            console.log('verify-domain value:', verifyDomainRecord.data.split('=')[1]);
            res.json({ data: verifyDomainRecord.data.split('=')[1] });
        } else {
            console.log("No 'verify-domain=' record found");
            res.status(400).json({ error: "No 'verify-domain=' record found" });
        }
    } catch (error) {
        console.error("Error:", error.message); // Log the error
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`External Adapter listening on port ${port}`));
