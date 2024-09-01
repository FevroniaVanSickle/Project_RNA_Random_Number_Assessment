/* eslint-disable */
const functions = require("firebase-functions");
const { google } = require("googleapis");
const cors = require("cors")({ origin: true });

// Initialize Google Drive API
const drive = google.drive("v3");

// Function to authenticate Google API
const authenticateGoogle = () => {
  const key = require(functions.config().google.service_account);
  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return auth.getClient();
};

// Cloud Function to upload CSV to Google Drive
exports.uploadCSVToDrive = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const auth = await authenticateGoogle();
      const driveService = google.drive({ version: "v3", auth });

      // Get the Base64-encoded CSV data from the request
      const base64Data = req.body.csvData;
      const csvBuffer = Buffer.from(decodeURIComponent(escape(atob(base64Data))), "utf-8");

      // Define metadata and media for the upload
      const fileMetadata = {
        name: "participantResults.csv", // Replace with desired file name
        parents: ["<Project_RNA_Results>"], // Optional: specify a folder
      };

      const media = {
        mimeType: "text/csv",
        body: csvBuffer,
      };

      // Upload file to Google Drive
      const response = await driveService.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
      });

      res.status(200).send(`File uploaded successfully. File ID: ${response.data.id}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).send("Error uploading file to Google Drive");
    }
  });
});
