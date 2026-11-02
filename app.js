const $=id=>document.getElementById(id);
let currentTool="game",lastResult=null;
const tools={
 game:["01","AI Game Creator","Turn your game idea into a detailed design plan."],
 world:["02","AI World Generator","Design maps, locations, environments and landmarks."],
 character:["03","AI Character Designer","Create fictional heroes, villains and character concepts."],
 mission:["04","AI Mission Creator","Generate objectives, mission steps and rewards."],
 mechanics:["05","AI Mechanics Designer","Plan controls, gameplay rules and game systems."],
 code:["06","AI Prototype Code","Ask AI for starter browser-game code files."]
};
function setTool(name){
 currentTool=name;
 document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.tool===name));
 const t=tools[name];$("toolNumber").textContent=t[0];$("toolTitle").textContent=t[1];$("toolDesc").textContent=t[2];
 $("prompt").placeholder="Describe what you want the AI to create...";
}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
document.querySelectorAll(".sample").forEach(b=>b.addEventListener("click",()=>{$("prompt").value=b.dataset.prompt;setTool("game")}));
async function status(){
 try{const r=await fetch("/api/status");const d=await r.json();$("apiStatus").textContent=d.aiConnected?"AI API connected":"AI API key required";$("apiStatus").classList.toggle("ok",d.aiConnected)}
 catch{$("apiStatus").textContent="Start the server first"}
}
status();
$("runAI").addEventListener("click",runAI);
async function runAI(){
 const prompt=$("prompt").value.trim();
 if(prompt.length<5){$("output").innerHTML='<div class="error">Please write a more detailed prompt.</div>';return}
 $("runAI").disabled=true;$("runAI").textContent="✦ AI is working…";
 $("output").innerHTML='<div class="empty"><div>✧</div><h2>Creating your result…</h2><p>Please wait for the AI response.</p></div>';
 try{
  const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool:currentTool,prompt,genre:$("genre").value,platform:$("platform").value})});
  const body=await r.json();if(!r.ok)throw new Error(body.error||"AI request failed");
  lastResult=body.data;render(body.data,currentTool);
 }catch(e){$("output").innerHTML=`<div class="error">${esc(e.message)}</div>`}
 finally{$("runAI").disabled=false;$("runAI").textContent="✦ Generate with AI";status()}
}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function arr(title,a){if(!Array.isArray(a)||!a.length)return "";return `<h3>${esc(title)}</h3><ul>${a.map(x=>`<li>${esc(typeof x==="string"?x:JSON.stringify(x))}</li>`).join("")}</ul>`}
function render(d,tool){
 let html="";
 if(tool==="game"){
  $("sceneName").textContent=d.title||"Game concept";
  html=`<h2>${esc(d.title||"Game design")}</h2><span class="tag">${esc(d.genre||"Game")}</span><span class="tag">${esc(d.platform||"Platform")}</span><p>${esc(d.summary||"")}</p><h3>WORLD & STORY</h3><p>${esc(d.world||"")} ${esc(d.story||"")}</p><h3>PLAYER</h3><p>${esc(d.player||"")}</p>${arr("CHARACTERS",d.characters)}${arr("ENEMIES",d.enemies)}${arr("WEAPONS",d.weapons)}${arr("VEHICLES",d.vehicles)}${arr("MISSIONS",d.missions)}${arr("GAMEPLAY",d.gameplay)}${arr("CONTROLS",d.controls)}<h3>MULTIPLAYER</h3><p>${esc(d.multiplayer||"Not specified")}</p>${arr("ASSETS NEEDED",d.assetsNeeded)}${arr("DEVELOPMENT PLAN",d.developmentPlan)}`;
 }else if(tool==="world"){
  html=`<h2>${esc(d.name||"World design")}</h2><p>${esc(d.description||"")}</p><h3>ENVIRONMENT</h3><p>${esc(d.environment||"")}</p>${arr("LOCATIONS",d.locations)}${arr("LANDMARKS",d.landmarks)}<h3>ATMOSPHERE</h3><p>${esc(d.atmosphere||"")}</p>${arr("GAMEPLAY OPPORTUNITIES",d.gameplayOpportunities)}${arr("ASSET PROMPTS",d.assetPrompts)}`;
 }else if(tool==="character"){
  html="<h2>Character concepts</h2>"+(d.characters||[]).map(c=>`<div class="filebox"><b>${esc(c.name)} — ${esc(c.role)}</b><p>${esc(c.appearance)}</p><p>${esc(c.outfit)}</p><p>${esc(c.personality)}</p>${arr("ABILITIES",c.abilities)}${arr("ANIMATION IDEAS",c.animationIdeas)}<h3>ASSET PROMPT</h3><p>${esc(c.assetPrompt)}</p></div>`).join("");
 }else if(tool==="mission"){
  html="<h2>Mission pack</h2>"+(d.missions||[]).map(m=>`<div class="filebox"><b>${esc(m.title)}</b><p><b>Objective:</b> ${esc(m.objective)}</p><p><b>Location:</b> ${esc(m.location)}</p>${arr("STEPS",m.steps)}<p><b>Challenge:</b> ${esc(m.challenge)}</p><p><b>Success:</b> ${esc(m.successCondition)}</p><p><b>Rewards:</b> ${esc(m.rewards)}</p></div>`).join("");
 }else if(tool==="mechanics"){
  html="<h2>Game systems</h2>"+(d.systems||[]).map(s=>`<div class="filebox"><b>${esc(s.name)}</b><p>${esc(s.purpose)}</p>${arr("PLAYER ACTIONS",s.playerActions)}${arr("RULES",s.rules)}${arr("FEEDBACK",s.feedback)}<p>${esc(s.implementationNotes)}</p></div>`).join("");
 }else if(tool==="code"){
  html="<h2>Prototype code files</h2><p>Review each generated file before using it. This is starter code, not a complete commercial game.</p>"+(d.files||[]).map((f,i)=>`<div class="filebox"><b>${esc(f.filename)} · ${esc(f.language)}</b><pre id="code${i}">${esc(f.content)}</pre><button class="outline copy" data-index="${i}">Copy code</button></div>`).join("");
  d.files?.forEach((f,i)=>document.querySelector(`[data-index="${i}"]`)?.addEventListener("click",()=>navigator.clipboard?.writeText(f.content)));
 }
 if(!html)html="<p>The AI returned no displayable fields. Try a more specific prompt.</p>";
 html+='<p class="tiny">AI output is a plan or prototype content. Actual 3D assets, finished playable games, multiplayer hosting and Android/PC builds need game-engine integration, testing and deployment.</p><button class="primary" id="download">Download result as JSON</button>';
 $("output").innerHTML=html;
 $("download").addEventListener("click",()=>download(lastResult));
}
function download(data){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="hh-game-studio-result.json";a.click();URL.revokeObjectURL(url)
}
$("saveProject").addEventListener("click",()=>{
 const data={prompt:$("prompt").value,genre:$("genre").value,platform:$("platform").value,tool:currentTool,result:lastResult};
 localStorage.setItem("hhStudioProject",JSON.stringify(data));
 $("saveProject").textContent="Saved ✓";setTimeout(()=>$("saveProject").textContent="Save project",1600);
});
