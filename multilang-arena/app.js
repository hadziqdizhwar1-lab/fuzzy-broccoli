const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const connectBtn = document.getElementById('connect');

let score = 0;
let ws = null;
const player = {x:100,y:200,w:32,h:32};
const enemy = {x:600,y:200,w:32,h:32};

window.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowUp') player.y-=30;
  if(e.key==='ArrowDown') player.y+=30;
  if(e.key==='ArrowLeft') player.x-=30;
  if(e.key==='ArrowRight') player.x+=30;
});

let AiModule=null, PhysicsModule=null;

function onWasmReady(){
  if(typeof Module!=='undefined'&&typeof physicsModule!=='undefined'){
    AiModule=Module;
    PhysicsModule=physicsModule;
    requestAnimationFrame(loop);
  }
}
window.addEventListener('load', onWasmReady);

function loop(){
  let aiDir=0;
  try{ aiDir=AiModule._ai_decide(player.x,player.y,enemy.x,enemy.y); }catch(e){}
  enemy.x+=aiDir*2;

  let collided=0;
  try{ collided=PhysicsModule._check_collision(player.x,player.y,player.w,player.h,enemy.x,enemy.y,enemy.w,enemy.h);}catch(e){}

  if(collided){ score=Math.max(0,score-1); enemy.x=600; } else score+=0.02;
  draw();
  scoreEl.textContent='Score: '+Math.floor(score);
  requestAnimationFrame(loop);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#66ffcc'; ctx.fillRect(player.x,player.y,player.w,player.h);
  ctx.fillStyle='#ff6677'; ctx.fillRect(enemy.x,enemy.y,enemy.w,enemy.h);
}

connectBtn.onclick=()=>{
  if(ws){ws.close();ws=null;connectBtn.textContent='Connect';return;}
  ws=new WebSocket('ws://localhost:8080/ws');
  ws.onopen=()=>{connectBtn.textContent='Disconnect';ws.send(JSON.stringify({type:'join',name:'Atha'}));};
  setInterval(()=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify({type:'score',score:Math.floor(score)}));},2000);
  ws.onmessage=(m)=>console.log('Server:',m.data);
};
