import express from "express";
import cors from "cors";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));

// Cloudflare R2-klient
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

// Proxy-route som STRÖMMAR videon i bitar direkt från R2.
// Tidigare laddades hela videon ner till servern vid varje anrop,
// vilket gjorde att videorna startade väldigt långsamt.
app.get("/proxy-video/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const range = req.headers.range; // webbläsaren ber om en bit av filen

  if (!fileName) return res.status(400).send("File name is required");

  try {
    const result = await client.send(
      new GetObjectCommand({
        Bucket: "ugc-videos",
        Key: fileName,
        Range: range, // R2 skickar bara den bit som behövs
      })
    );

    const headers = {
      "Content-Type": result.ContentType || "video/mp4",
      "Content-Length": result.ContentLength,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
    };

    if (range && result.ContentRange) {
      headers["Content-Range"] = result.ContentRange;
      res.writeHead(206, headers);
    } else {
      res.writeHead(200, headers);
    }

    result.Body.pipe(res);
  } catch (err) {
    if (err.name === "NoSuchKey") {
      return res.status(404).send("Video not found");
    }
    console.error("Error proxying video:", err);
    if (!res.headersSent) res.status(500).send("Failed to fetch video");
  }
});

// Enkel route för att "väcka" servern
app.get("/health", (req, res) => res.send("ok"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
