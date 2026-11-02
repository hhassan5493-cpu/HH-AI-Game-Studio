import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app=express();
const root=path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:"2mb"}));
app.use(express.static(path.join(root,"public")));

app.get("/api/status",(_,res)=>res.json({
  aiConnected:Boolean(process.env.OPENAI_API_KEY),
  model:process.env.AI_MODEL || "gpt-5.5"
}));

app.post("/api/ai",async(req,res)=>{
  const {tool,prompt,genre="Any",platform="Android and PC"}=req.body||{};
  const allowed=["game","world","character","mission","mechanics","code"];
  if(!allowed.includes(tool)) return res.status(400).json({error:"Unknown AI tool."});
  if(typeof prompt!=="string"||prompt.trim().length<5)
    return res.status(400).json({error:"Please enter a more detailed prompt."});
  if(!process.env.OPENAI_API_KEY)
    return res.status(503).json({error:"AI is not connected. Add OPENAI_API_KEY as a private server secret. Never put it in browser code."});

  const instructions={
    game:"Create a detailed, practical game design plan. Return JSON with title, genre, platform, summary, visualStyle, story, world, player, characters[], enemies[], weapons[], vehicles[], missions[], gameplay[], controls[], multiplayer, assetsNeeded[], developmentPlan[]. Do not claim a finished game has been built.",
    world:"Design a game world. Return JSON with name, description, environment, locations[], landmarks[], atmosphere, gameplayOpportunities[], assetPrompts[].",
    character:"Design fictional game characters. Return JSON with characters array; each character has name, role, appearance, outfit, personality, abilities[], animationIdeas[], assetPrompt.",
    mission:"Create a mission pack. Return JSON with missions array; each mission has title, objective, location, steps[], challenge, successCondition, rewards.",
    mechanics:"Design game mechanics. Return JSON with systems array; each has name, purpose, playerActions[], rules[], feedback[], implementationNotes[].",
    code:"Act as a game developer. Return JSON with files array; each has filename, language, content. Generate a small, runnable browser-game prototype using HTML/CSS/JavaScript when possible. Keep code safe and self-contained; explain limitations. Do not claim Android APK or multiplayer hosting is included."
  };
  try{
    const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const result=await client.responses.create({
      model:process.env.AI_MODEL||"gpt-5.5",
      instructions:instructions[tool]+" Return valid JSON only, no markdown fences. Be honest about external assets, game engines, API costs, hosting and build requirements.",
      input:`Genre: ${genre}\nTarget platform: ${platform}\nUser request: ${prompt.trim()}`
    });
    let raw=(result.output_text||"").trim().replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();
    res.json({data:JSON.parse(raw)});
  }catch(e){
    console.error(e);
    res.status(500).json({error:"AI request failed. Check your API key, model access, internet and API billing/limits."});
  }
});

const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`HH AI Game Studio running on port ${port}`));
