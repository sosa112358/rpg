(() => {
  const home = document.querySelector('#home');
  const hero = home.querySelector('.hero');
  hero.className = 'field-heading';
  hero.innerHTML = '<div><p class="eyebrow">CHAPTER 01 ・ 星見の丘</p><h1>フィールド</h1><p>歩いて、旅人に話しかけて、宝箱を見つけよう。</p></div><div class="field-help">移動　W A S D / 矢印キー　　調べる　Space</div>';
  const field = document.createElement('section');
  field.className = 'adventure';
  field.innerHTML = '<div class="world-frame"><canvas id="world" aria-label="星見の丘を歩く2Dフィールド"></canvas><span class="world-location">星見の丘　—　夜</span><div id="worldMessage" class="world-message">WASD / 矢印キーで歩く。青い旅人や宝箱の近くで Space。</div></div><div class="field-toolbar"><div class="field-legend"><span>🧙🏻‍♀️ あなた</span><span>🧍 旅人</span><span>🎁 宝箱</span></div><div class="touch-pad" aria-label="移動操作"><button data-move="up" aria-label="上へ">▲</button><button data-move="left" aria-label="左へ">◀</button><button data-move="down" aria-label="下へ">▼</button><button data-move="right" aria-label="右へ">▶</button></div><button id="fieldAction" class="primary field-action">調べる <span>Space</span></button></div>';
  hero.after(field);
  const homeNav = document.querySelector('.nav-item[data-screen="home"]');
  homeNav.innerHTML = '<span>⌖</span>フィールド';
  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const message = document.querySelector('#worldMessage');
  const W = 1200, H = 675, WORLD_W = 1800, WORLD_H = 1200, TILE = 50;
  canvas.width = W; canvas.height = H;
  const player = {x: 570, y: 590, dir: 'down', step: 0};
  const traveler = {x: 1000, y: 560};
  const chest = {x: 760, y: 730, opened: false};
  const slime = {x: 1280, y: 480};
  const held = new Set();
  const trees = [];
  for (let y = 80; y < WORLD_H - 40; y += 125) for (let x = 55; x < WORLD_W - 40; x += 135) {
    const n = (x * 17 + y * 29) % 101;
    if (n < 52 || x < 280 || x > 1500 || y < 180 || y > 980) {
      const tx = x + (n % 37), ty = y + ((n * 3) % 29);
      if (Math.abs(tx - 570) > 140 && Math.abs(ty - 590) > 120 && Math.abs(tx - traveler.x) > 90 && Math.abs(ty - traveler.y) > 90 && Math.abs(tx - chest.x) > 90 && Math.abs(ty - chest.y) > 90) trees.push({x:tx,y:ty});
    }
  }
  const keyMap = {ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  window.addEventListener('keydown', e => {
    if (keyMap[e.key]) { held.add(keyMap[e.key]); e.preventDefault(); }
    if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') { e.preventDefault(); interact(); }
  });
  window.addEventListener('keyup', e => { if (keyMap[e.key]) held.delete(keyMap[e.key]); });
  window.addEventListener('blur', () => held.clear());
  document.querySelectorAll('[data-move]').forEach(button => {
    const dir = button.dataset.move;
    button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); held.add(dir); });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type, () => held.delete(dir));
  });
  document.querySelector('#fieldAction').addEventListener('click', interact);
  function interact() {
    const near = (obj, range=90) => Math.hypot(player.x-obj.x, player.y-obj.y) < range;
    if (near(chest, 105)) {
      if (!chest.opened) { chest.opened = true; if (typeof save !== 'undefined') { save.crystals += 30; saveGame(); } say('宝箱を開けた！ 星のかけらを30個手に入れた。'); }
      else say('宝箱は空っぽだ。');
    } else if (near(traveler, 110)) say('旅人「森の向こうに魔物がいる。準備はいい？」');
    else if (near(slime, 110)) { say('森のスライムが道をふさいでいる！ バトル開始。'); setTimeout(() => setScreen('battle'), 550); }
    else say('夜空には、まだ見ぬ星が輝いている。');
  }
  let messageTimer;
  function say(text) { message.textContent = text; message.classList.add('visible'); clearTimeout(messageTimer); messageTimer = setTimeout(() => message.classList.remove('visible'), 2800); }
  function rounded(x,y,w,h,r,color) { ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); }
  function drawTree(x,y) {
    ctx.fillStyle='#111b20';ctx.beginPath();ctx.ellipse(x,y+18,30,13,0,0,Math.PI*2);ctx.fill();
    rounded(x-7,y-8,14,37,5,'#674934');
    ctx.fillStyle='#184b42';ctx.beginPath();ctx.arc(x,y-20,34,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#246250';ctx.beginPath();ctx.arc(x-16,y-25,22,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#32715a';ctx.beginPath();ctx.arc(x+13,y-34,17,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#8ec99a';ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(x-13,y-38,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  function drawPerson(x,y,kind,dir,step,label) {
    ctx.fillStyle='#10151b88';ctx.beginPath();ctx.ellipse(x,y+6,20,8,0,0,Math.PI*2);ctx.fill();
    const bob=step?Math.sin(step)*2:0;
    if(kind==='hero'){
      rounded(x-12,y-14+bob,24,25,7,'#d4b25e');rounded(x-9,y-9+bob,18,19,5,'#7565a4');
      ctx.fillStyle='#ead0ae';ctx.beginPath();ctx.arc(x,y-24+bob,10,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#583d38';ctx.beginPath();ctx.arc(x,y-28+bob,11,Math.PI,Math.PI*2);ctx.fill();
      if(dir==='left'||dir==='right'){ctx.fillStyle='#26212a';ctx.fillRect(x+(dir==='left'?-8:4),y-25+bob,3,3)}
      rounded(x-10,y+8,7,11,3,'#594858');rounded(x+3,y+8,7,11,3,'#594858');
    } else {
      rounded(x-13,y-13,26,27,7,kind==='traveler'?'#5795a8':'#a3d271');
      ctx.fillStyle=kind==='traveler'?'#eacdad':'#75b94f';ctx.beginPath();ctx.arc(x,y-22,10,0,Math.PI*2);ctx.fill();
      if(kind==='slime'){ctx.fillStyle='#e9ffd2';ctx.fillRect(x-5,y-24,3,3);ctx.fillRect(x+3,y-24,3,3)}
      else {ctx.fillStyle='#eee';ctx.fillRect(x-5,y-24,3,3);ctx.fillRect(x+3,y-24,3,3);ctx.fillStyle='#222';ctx.fillRect(x-4,y-23,2,2);ctx.fillRect(x+4,y-23,2,2)}
      rounded(x-10,y+9,7,9,3,'#453c4a');rounded(x+3,y+9,7,9,3,'#453c4a');
    }
    if(label){ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(label,x,y-48)}
  }
  function draw() {
    const camX=Math.max(0,Math.min(WORLD_W-W,player.x-W/2)),camY=Math.max(0,Math.min(WORLD_H-H,player.y-H/2));
    ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(-camX,-camY);
    ctx.fillStyle='#5c9360';ctx.fillRect(0,0,WORLD_W,WORLD_H);
    for(let y=0;y<WORLD_H;y+=TILE)for(let x=0;x<WORLD_W;x+=TILE){const v=(x*31+y*19)%13;if(v<4){ctx.fillStyle=v===0?'#6a9e67':'#639664';ctx.fillRect(x+(v*7),y+((v*11)%40),3,4)}}
    ctx.strokeStyle='#b89b69';ctx.lineWidth=130;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(80,600);ctx.bezierCurveTo(330,570,450,670,670,630);ctx.bezierCurveTo(820,610,840,520,1040,540);ctx.bezierCurveTo(1280,565,1390,450,1730,390);ctx.stroke();
    ctx.strokeStyle='#d2b67f';ctx.lineWidth=110;ctx.beginPath();ctx.moveTo(80,600);ctx.bezierCurveTo(330,570,450,670,670,630);ctx.bezierCurveTo(820,610,840,520,1040,540);ctx.bezierCurveTo(1280,565,1390,450,1730,390);ctx.stroke();
    ctx.strokeStyle='#e2cd9b';ctx.lineWidth=3;ctx.setLineDash([10,18]);ctx.beginPath();ctx.moveTo(80,600);ctx.bezierCurveTo(330,570,450,670,670,630);ctx.bezierCurveTo(820,610,840,520,1040,540);ctx.bezierCurveTo(1280,565,1390,450,1730,390);ctx.stroke();ctx.setLineDash([]);
    trees.forEach(t=>drawTree(t.x,t.y));
    // A low stone wall marks the edge of the meadow.
    for(let x=280;x<1480;x+=48){if((x>490&&x<660)||(x>920&&x<1100))continue;rounded(x,210+(x%3)*3,43,24,5,'#817c76');rounded(x+5,213+(x%3)*3,32,7,3,'#a7a095')}
    // Chest and characters are sorted by their feet so they sit on the ground.
    const objects=[{y:chest.y,draw:()=>{ctx.fillStyle='#161b21aa';ctx.beginPath();ctx.ellipse(chest.x,chest.y+7,24,8,0,0,Math.PI*2);ctx.fill();rounded(chest.x-19,chest.y-22,38,29,5,chest.opened?'#655038':'#986329');rounded(chest.x-20,chest.y-24,40,12,5,chest.opened?'#755d42':'#c38a3b');ctx.fillStyle='#f1d074';ctx.fillRect(chest.x-3,chest.y-17,6,10);ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText('🎁',chest.x,chest.y-37)}},{y:traveler.y,draw:()=>drawPerson(traveler.x,traveler.y,'traveler','down',0,'🧍')},{y:slime.y,draw:()=>drawPerson(slime.x,slime.y,'slime','down',0,'')},{y:player.y,draw:()=>drawPerson(player.x,player.y,'hero',player.dir,player.step,'')}];
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    const nearby=[chest,traveler,slime].find(o=>Math.hypot(player.x-o.x,player.y-o.y)<100);
    if(nearby){ctx.strokeStyle='#f4d483';ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x,player.y-33,17,Math.PI,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }
  let last=0;
  function loop(now){const dt=Math.min((now-last)/16.67,2);last=now;let dx=0,dy=0;if(held.has('up'))dy--;if(held.has('down'))dy++;if(held.has('left'))dx--;if(held.has('right'))dx++;if(dx||dy){const mag=Math.hypot(dx,dy);dx/=mag;dy/=mag;const nx=player.x+dx*3.2*dt,ny=player.y+dy*3.2*dt;const blocked=trees.some(t=>Math.hypot(nx-t.x,ny-t.y)<37);if(!blocked){player.x=Math.max(35,Math.min(WORLD_W-35,nx));player.y=Math.max(250,Math.min(WORLD_H-30,ny))}player.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');player.step+=.2*dt}draw();requestAnimationFrame(loop)}
  requestAnimationFrame(loop);
})();
