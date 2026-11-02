
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

app.get("/style.css", (req, res) => {
  res.sendFile(process.cwd() + "/style.css");
});

app.post("/api/ai", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "AI API key is not configured."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const result = await client.responses.create({
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      input: JSON.stringify(req.body)
    });

    res.json({
      result: result.output_text
    });

  } catch (error) {
    res.status(500).json({
      error: "AI generation failed. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("HH AI Game Studio is running!");
});
