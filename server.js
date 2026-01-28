import express from "express";
import cors from "cors";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Tillåt frontend
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

// Proxy-route med Range support
app.get("/proxy-video/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    const range = req.headers.range; // För mobil/video-buffring

    if (!fileName) return res.status(400).send("File name is required");

    // Hämta signed URL
    const command = new GetObjectCommand({
      Bucket: "ugc-videos",
      Key: fileName,
    });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });

    // Hämta videon
    const videoResp = await fetch(url);
    if (!videoResp.ok) throw new Error(`Failed to fetch video: ${videoResp.statusText}`);

    // Konvertera till Buffer för range-support
    const videoBuffer = Buffer.from(await videoResp.arrayBuffer());
    const videoSize = videoBuffer.length;

    if (range) {
      // Hantera range-request
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4",
      });
      res.end(videoBuffer.slice(start, end + 1));
    } else {
      // Ingen range, skicka hela videon
      res.writeHead(200, {
        "Content-Length": videoSize,
        "Content-Type": "video/mp4",
      });
      res.end(videoBuffer);
    }
  } catch (err) {
    console.error("Error proxying video:", err);
    res.status(500).send("Failed to fetch video");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
