const { google } = require("googleapis");
const functions = require("firebase-functions");
const stream = require('stream');
const cors = require('cors')({ origin: true });
require('dotenv').config();


// Function to authenticate Google API
const authenticateGoogle = async () => {
  try {
    // const key = require(functions.config().google.service_account);
    const key = require('./currentKey.json');
    const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/drive"], // recommend only accessing the folder you need
  });
  const client = await auth.getClient();
  console.log('Authentication successful!');
  return client;
  } catch (error) {
    console.error('Error during authentication:', error.message);
    return null;
  }
};

// Cloud Function to upload CSV to Google Drive
exports.uploadCSVToDrive = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({message:"Method Not Allowed :("});
    }
    try {

        if (!req.body.csvData) {
          return res.status(400).send("No CSV data provided");
        }

      const auth = await authenticateGoogle();
      const driveService = google.drive({ version: "v3", auth });

      // Get the Base64-encoded CSV data from the request
      const base64Data = req.body.csvData;
      const csvBuffer = Buffer.from(decodeURIComponent(escape(atob(base64Data))), "utf-8");
      const passThroughStream = new stream.PassThrough();
      passThroughStream.end(csvBuffer);

      // Define metadata and media for the upload
      const timestamp = Date.now(); 
      // const folderID = process.env.FOLDER;
       const folderID = '';//REPLACE WITH FOLDER ID
      const fileMetadata = {
        name: `${timestamp}_data.csv`, 
        parents: [folderID], //store in config
      };

      const media = {
        mimeType: "text/csv",
        body: passThroughStream,
      };

      // Upload file to Google Drive
      const response = await driveService.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });

      res.status(200).json({ message:  `File uploaded successfully! File ID: ${response.data.id}` });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(404).json({ message: `Error uploading file to Google Drive: ${error.message}` });
    }
  });
});

