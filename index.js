// Import required modules
const express = require('express');
const { SignProtocolClient, SpMode, EvmChains, OffChainSignType, IndexService } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Off-chain schema
const arSchema = 'SPS_95pqOR5XTArF7VuBleXms';

/* 
*! ON-CHAIN - Uncomment to send to ETH-SEPOLIA

const privateKey = "";
const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  account: privateKeyToAccount(privateKey)
});

*/

// Used for offchain
const client = new SignProtocolClient(SpMode.OffChain, {
    signType: OffChainSignType.EvmEip712,
    account: privateKeyToAccount('0xe052e511ae2bf7e8481af925911d133969b419be8152075a5e0bf87b758965b3'), // Optional
});

// Use for the first time to create a Schema
async function firstTimeRun(){

    const schemaId = await client.createSchema({
        name: "Student Records",
        data: [
            { name: 'Student ID', type: 'string' },
            { name: 'Course Title', type: 'string' },
            { name: 'Completion Date', type: 'datetime' }
        ],
    });
    console.log(schemaId);
}

// Create a new attestation using the schema
async function createAttestation(learnerId, courseTitle) {
    const signedAttestation = await client.createAttestation({
        schemaId: arSchema,
        data: {
            'Student ID': learnerId,                // Matches 'Student ID' in schema
            'Course Title': courseTitle,            // Matches 'Course Title' in schema
            'Completion Date': new Date().toISOString(),  // Matches 'Completion Date' in schema
        },
        indexingValue: "learner",
      });
  return signedAttestation;
}

// Get all info about the Schema that exists...
async function getOffChainAttestationsBySchema(schemaId) {

    const indexService = new IndexService("mainnet");

    try {
        const attestations = await indexService.querySchema(arSchema);
        console.log(attestations)

        return attestations;
    } catch (error) {
        console.error("Error retrieving attestations:", error);
        throw error;
    }
}

async function attestationsByStudent(studentId) {

    // Initialize the IndexService with the client
    const indexService = new IndexService("mainnet");

    try {
        const getAttestationProfile = await indexService.queryAttestationList({
            schemaId: arSchema, 
            filters: {
                'Student ID': studentId,
            },
            page: 1, 
            size: 10,
            mode: "offchain",
        });

        if (getAttestationProfile && getAttestationProfile.rows && Array.isArray(getAttestationProfile.rows)) {
            const parsedData = [];

            // Iterate over each row
            getAttestationProfile.rows.forEach(row => {
                if (row.data) {
                    try {
                        // Parse the 'data' JSON string into an object
                        const dataObject = JSON.parse(row.data);
                        parsedData.push(dataObject);
                        
                        // Debugging output:
                        console.log('Parsed Data Object:', dataObject);
                    } catch (e) {
                        console.error('Error parsing row data:', e);
                    }
                }
            });

            return parsedData;

        } else {
            console.error('Invalid response format');
            return [];
        }
    } catch (error) {
        console.error('Error fetching attestations:', error);
        return [];
    }
}

async function attestedStudents() {

    // Initialize the IndexService with the client
    const indexService = new IndexService("mainnet");

    try {
        const getAttestationProfile = await indexService.queryAttestationList({
            schemaId: arSchema, 
            page: 1, 
            size: 10,
            mode: "offchain",
        });

        if (getAttestationProfile && getAttestationProfile.rows && Array.isArray(getAttestationProfile.rows)) {
            const parsedData = [];

            // Iterate over each row
            getAttestationProfile.rows.forEach(row => {
                if (row.data) {
                    try {
                        // Parse the 'data' JSON string into an object
                        const dataObject = JSON.parse(row.data);
                        parsedData.push(dataObject);
                        
                        // Debugging output:
                        console.log('Parsed Data Object:', dataObject);
                    } catch (e) {
                        console.error('Error parsing row data:', e);
                    }
                }
            });

            return parsedData;

        } else {
            console.error('Invalid response format');
            return [];
        }
    } catch (error) {
        console.error('Error fetching attestations:', error);
        return [];
    }
}

// Routes
app.get('/getStudents/', async (req, res) => {
    try {
        const students = await attestedStudents();
        res.json(students);
    } catch (error) {
        console.error('Error in API call:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/getStudentCourses/:uid', async (req, res) => {
    try {
        const studentId = req.params.uid;
        const courses = await attestationsByStudent(studentId);
        res.json(courses);
    } catch (error) {
        console.error('Error in API call:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to create a new entry
app.post('/createEntry', async (req, res) => {

    const { studentId, courseTitle } = req.body;
    const resp = await createAttestation(studentId,courseTitle);
    console.log(resp);

    res.json({ message: 'Entry created successfully!' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});


/* 
** Find all info about an existing Schema
*! getOffChainAttestationsBySchema(arSchema)
*/ 

/*
** Run this to create Schema the first time for any chain or new Schema....
*! firstTimeRun();
*/