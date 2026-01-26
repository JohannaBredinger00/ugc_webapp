import express from "express";
import cors from "cors";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
const PORT = process.env.PORT || 3000;

// Tillåt frontend (för test kan du sätta "*")
app.use(cors({ origin: "*" }));

// Cloudflare R2 klient
const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "https://f87efb2122acf9eec3cdd22b7336cf4f.eu.r2.cloudflarestorage.com", // byt till ditt account_id
  credentials: {
  accessKeyId: process.env.R2_ACCESS_KEY_ID, // byt till dina keys
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

// Route som returnerar signed URL
app.get("/signed-url/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;

    const command = new GetObjectCommand({
      Bucket: "ugc-videos", 
      Key: fileName
    });

    // URL giltig 1 timme
    const url = await getSignedUrl(client, command, { expiresIn: 3600 })
    res.json({ url });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
