import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

app.get("/api/status", (req, res) => {
  res.json({
    aiConnected: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/ai", async (req, res) => {
  try {
    const { tool, prompt, genre, platform } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "Please connect your OpenAI API key."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      instructions: "You are HH AI Game Studio. Create detailed game designs, worlds, characters, missions and game mechanics. Return valid JSON only. Be honest: do not claim you have created a finished playable 3D game.",
      input: JSON.stringify({
        tool,
        prompt,
        genre,
        platform
      })
    });

    const result = JSON.parse(response.output_text);

    res.json({ data: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI generation failed. Check your API key and API access."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("HH AI Game Studio is running!");
});
