import express from "express";
import cors from "cors";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch"; // för proxy-streaming

const app = express();
const PORT = process.env.PORT || 3000;

// Tillåt frontend (för test kan du sätta "*")
app.use(cors({ origin: "*" }));

// Cloudflare R2 klient
const client = new S3Client({
  region: "auto",
  endpoint:
    process.env.R2_ENDPOINT ||
    "https://f87efb2122acf9eec3cdd22b7336cf4f.eu.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/*
// Route som returnerar signed URL
app.get("/signed-url/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;

    const command = new GetObjectCommand({
      Bucket: "ugc-videos",
      Key: fileName,
    });

    // URL giltig 1 timme
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});
*/

// NY PROXY-ROUTE: Streamar video via servern
app.get("/proxy-video/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;

    const command = new GetObjectCommand({
      Bucket: "ugc-videos",
      Key: fileName,
    });

    // Generera signed URL
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    // Hämta videon från R2 och streama till klienten
    const videoResp = await fetch(url);

    if (!videoResp.ok) {
      throw new Error(`Failed to fetch video: ${videoResp.statusText}`);
    }

    // Sätt rätt content-type
    res.setHeader("Content-Type", "video/mp4");
    // Streama kroppen direkt till klienten
    videoResp.body.pipe(res);
  } catch (err) {
    console.error("Error proxying video:", err);
    res.status(500).send("Failed to fetch video");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
