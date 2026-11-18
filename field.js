(() => {
  const home = document.querySelector('#home');
  const hero = home.querySelector('.hero');
  hero.className = 'field-heading';
  hero.innerHTML = '<div><p class="eyebrow">CHAPTER 01 ・ 星見の丘</p><h1>フィールド</h1><p>歩いて、旅人に話しかけて、宝箱を見つけよう。</p></div><div class="field-help">移動　W A S D / 矢印キー　　調べる　Space</div>';
  hero.querySelector('.eyebrow').textContent = 'CHAPTER 01 ・ 星見の丘';
  hero.querySelector('h1').textContent = '星見の丘';
  hero.querySelector('p:not(.eyebrow)').textContent = '村人と話し、森を歩き、星の物語を見つけよう。';
  hero.querySelector('.field-help').textContent = '移動: WASD / 矢印キー　会話: Space';
  const field = document.createElement('section');
  field.className = 'adventure';
  field.innerHTML = '<div class="world-frame"><canvas id="world" aria-label="星見の丘を歩くドット絵2Dフィールド"></canvas><span class="world-location">星見の丘　—　夜</span><div id="worldMessage" class="world-message">WASD / 矢印キーで歩く。青い旅人や宝箱の近くで Space。</div></div><div class="field-toolbar"><div class="field-legend"><span>主人公</span><span>旅人</span><span>宝箱</span></div><div class="touch-pad" aria-label="移動操作"><button data-move="up" aria-label="上へ">▲</button><button data-move="left" aria-label="左へ">◀</button><button data-move="down" aria-label="下へ">▼</button><button data-move="right" aria-label="右へ">▶</button></div><button id="fieldAction" class="primary field-action">調べる <span>Space</span></button></div>';
  hero.after(field);
  // Keep exploration, story, battle, and summons on one persistent game screen.
  const dashboard = document.createElement('div');
  dashboard.className = 'game-dashboard';
  field.after(dashboard);
  dashboard.append(field);
  const panel = document.createElement('aside');
  panel.className = 'quick-panel';
  panel.innerHTML = '<div class="quick-tabs"><button data-quick="story" class="active">物語</button><button data-quick="battle">戦闘</button><button data-quick="gacha">召喚</button></div><div class="quick-content"><section class="quick-pane" id="quick-story"></section><section class="quick-pane" id="quick-battle"></section><section class="quick-pane" id="quick-gacha"></section></div>';
  dashboard.append(panel);
  const storySection = document.querySelector('#story');
  const gachaSection = document.querySelector('#gacha');
  const battleSection = document.querySelector('#battle');
  document.querySelector('#quick-story').append(storySection.querySelector('.story-card'));
  document.querySelector('#quick-gacha').append(gachaSection.querySelector('.banner'), gachaSection.querySelector('.summon-actions'), gachaSection.querySelector('#roster'));
  document.querySelector('#quick-battle').append(battleSection.querySelector('.battle-head'), battleSection.querySelector('.battlefield'), battleSection.querySelector('.battle-bottom'));
  storySection.remove(); gachaSection.remove(); battleSection.remove();
  document.querySelector('.home-lower')?.remove();
  const quickPanes = [...document.querySelectorAll('.quick-pane')];
  const encounterOverlay = document.createElement('div');
  encounterOverlay.className = 'encounter-overlay';
  encounterOverlay.innerHTML = '<section class="encounter-window"><button class="encounter-close" type="button">× 閉じる</button><div class="encounter-body"></div></section>';
  home.append(encounterOverlay);
  const encounterBody = encounterOverlay.querySelector('.encounter-body');
  quickPanes.forEach(p => encounterBody.append(p));
  encounterOverlay.addEventListener('click', e => { if (e.target === encounterOverlay || e.target.closest('.encounter-close')) encounterOverlay.classList.remove('visible'); });
  function selectQuick(id, open = true) {
    const chosen = id === 'gacha' ? 'gacha' : id === 'battle' ? 'battle' : 'story';
    quickPanes.forEach(p => p.classList.toggle('active', p.id === 'quick-' + chosen));
    document.querySelectorAll('[data-quick]').forEach(b => b.classList.toggle('active', b.dataset.quick === chosen));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.screen === chosen));
    if (open) { held.clear(); encounterOverlay.classList.add('visible'); }
    if (chosen === 'battle' && !battle.started) startBattle();
  }
  document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => selectQuick(b.dataset.quick)));
  // Existing navigation and story transitions now switch the in-screen panel only.
  setScreen = id => selectQuick(id);
  document.querySelectorAll('.nav-item').forEach(b => {
    b.textContent = b.dataset.screen === 'battle' ? '戦闘' : b.dataset.screen === 'gacha' ? '召喚' : b.dataset.screen === 'story' ? '物語' : '世界';
    const icon = document.createElement('span');
    icon.textContent = b.dataset.screen === 'battle' ? '⚔' : b.dataset.screen === 'gacha' ? '✧' : b.dataset.screen === 'story' ? '▤' : '⌖';
    b.prepend(icon);
    b.classList.toggle('active', b.dataset.screen === 'story');
  });
  selectQuick('story', false);
  document.querySelector('#storyNext').addEventListener('click', e => {
    if (document.querySelector('#storyProgress').textContent.trim().startsWith(String(story.length).padStart(2, '0'))) {
      e.preventDefault(); e.stopImmediatePropagation(); storyComplete = true;
      encounterOverlay.classList.remove('visible');
      setObjective('森のスライムを倒そう');
      say('道の先にスライムがいる。近づくと戦闘が始まるよ。');
    }
  }, true);
  window.addEventListener('rpg-battle-won', () => { battleWon = true; setObjective('召喚師に会いに行こう'); say('勝利！ 村の召喚師を訪ねよう。'); });
  window.addEventListener('rpg-summoned', () => { setObjective('冒険を続けて、次の物語を探そう'); });
  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const message = document.querySelector('#worldMessage');
  const fieldAction = document.querySelector('#fieldAction');
  message.textContent = '村人や召喚師の近くで Space。魔物に近づくと戦闘開始。';
  const objective = document.createElement('div');
  objective.className = 'quest-hud';
  objective.innerHTML = '<small>つぎの目的</small><strong>村人に会って話そう</strong>';
  document.querySelector('.world-frame').append(objective);
  function setObjective(text) { objective.querySelector('strong').textContent = text; }
  const W = 1200, H = 675, WORLD_W = 1800, WORLD_H = 1200, TILE = 50;
  canvas.width = 600;
  canvas.height = 338;
  ctx.imageSmoothingEnabled = false;
  const spriteSheet = new Image();
  spriteSheet.src = 'assets/protagonist-sheet.png';
  spriteSheet.addEventListener('error', () => console.error('主人公スプライトを読み込めませんでした。'));

  const player = {x: 570, y: 590, dir: 'down', step: 0, moving: false};
  const traveler = {x: 690, y: 565};
  const chest = {x: 760, y: 730, opened: false};
  const slime = {x: 1070, y: 545};
  const village = {x: 1160, y: 770};
  const summoner = {x: 1110, y: 840};
  const pond = {x: 265, y: 875, rx: 200, ry: 115};
  const held = new Set();
  const trees = [];
  let storyMet = false, storyComplete = false, summonMet = false, slimeMet = false, battleWon = false;
  for (let y = 80; y < WORLD_H - 40; y += 125) for (let x = 55; x < WORLD_W - 40; x += 135) {
    const n = (x * 17 + y * 29) % 101;
    if (n < 52 || x < 280 || x > 1500 || y < 180 || y > 980) {
      const tx = x + (n % 37), ty = y + ((n * 3) % 29);
      if (Math.abs(tx - 570) > 140 && Math.abs(ty - 590) > 120 && Math.abs(tx - traveler.x) > 90 && Math.abs(ty - traveler.y) > 90 && Math.abs(tx - chest.x) > 90 && Math.abs(ty - chest.y) > 90 && Math.abs(tx-village.x)>115 && Math.abs(ty-village.y)>115 && Math.abs(tx-summoner.x)>100 && Math.abs(ty-summoner.y)>100) trees.push({x:tx,y:ty});
    }
  }
  const keyMap = {ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  window.addEventListener('keydown', e => {
    if (encounterOverlay.classList.contains('visible')) { if (e.key === 'Escape') encounterOverlay.classList.remove('visible'); return; }
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
  fieldAction.textContent = '調べる';
  fieldAction.addEventListener('click', interact);
  function interact() {
    const near = (obj, range=90) => Math.hypot(player.x-obj.x, player.y-obj.y) < range;
    if (near(chest, 105)) {
      if (!chest.opened) { chest.opened = true; if (typeof save !== 'undefined') { save.crystals += 30; saveGame(); } say('宝箱を開けた！ 星のかけらを30個手に入れた。'); }
      else say('宝箱は空っぽだ。');
    } else if (near(traveler, 110)) { say('村人が手招きしている。'); setScreen('story'); }
    else if (near(summoner, 115)) { say('村の召喚師が星霊召喚を案内している。'); setScreen('gacha'); }
    else if (near(slime, 110)) { say('森のスライムが襲いかかってきた！'); setTimeout(() => setScreen('battle'), 300); }
    else say('夜空には、まだ見ぬ星が輝いている。');
  }
  let messageTimer;
  function say(text) { message.textContent = text; message.classList.add('visible'); clearTimeout(messageTimer); messageTimer = setTimeout(() => message.classList.remove('visible'), 2800); }
  function block(x,y,w,h,color) { ctx.fillStyle=color; ctx.fillRect(Math.round(x),Math.round(y),w,h); }
  function drawTree(x,y) {
    block(x-30,y+14,62,12,'#233c32');
    block(x-8,y-7,17,35,'#68452f');
    block(x-35,y-30,70,30,'#17493b');
    block(x-25,y-48,53,24,'#1c5943');
    block(x-14,y-63,32,20,'#276b4a');
    block(x-22,y-45,10,7,'#4e8a56');
    block(x+12,y-29,9,7,'#39774c');
  }
  function drawPerson(x,y,kind,dir,step,label) {
    const bob = step ? Math.sin(step) * 2 : 0;
    const colors = kind === 'traveler'
      ? {body:'#39718a',light:'#85c9d4',head:'#e4c4a0',hair:'#39475d',boots:'#3a3543'}
      : kind === 'summoner'
        ? {body:'#744d75',light:'#d19ab9',head:'#f0cfb0',hair:'#5b3c5a',boots:'#433143'}
        : {body:'#5c9b4e',light:'#a1d36b',head:'#bfe98b',hair:'#538c42',boots:'#3c4936'};
    block(x-13,y-1+bob,26,20,colors.body);
    block(x-17,y-13+bob,34,11,colors.light);
    block(x-9,y-27+bob,18,14,colors.head);
    block(x-11,y-31+bob,22,7,colors.hair);
    block(x-10,y+18+bob,8,10,colors.boots);
    block(x+3,y+18+bob,8,10,colors.boots);
    block(x-5,y-23+bob,3,3,'#211d26');
    block(x+3,y-23+bob,3,3,'#211d26');
    if(label){ctx.font='14px monospace';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(label,x,y-42)}
  }
  function drawHero() {
    const down = [{x:400,y:26,w:158,h:222},{x:580,y:26,w:158,h:222},{x:765,y:26,w:170,h:222}];
    const side = [{x:405,y:265,w:165,h:226},{x:580,y:265,w:165,h:226},{x:765,y:265,w:165,h:226},{x:940,y:265,w:145,h:226},{x:1080,y:265,w:165,h:226}];
    const up = [{x:400,y:495,w:160,h:208},{x:580,y:495,w:165,h:208},{x:765,y:495,w:165,h:208},{x:940,y:495,w:160,h:208}];
    const frames = player.dir === 'down' ? down : player.dir === 'up' ? up : side;
    const frame = frames[player.moving ? Math.floor(player.step / 3) % frames.length : 0];
    const bob = player.moving ? 0 : Math.sin(player.step) * 1.5;
    const width = 78, height = 108, x = player.x - width / 2, y = player.y - height + bob;
    if (spriteSheet.complete && spriteSheet.naturalWidth) {
      ctx.save();
      if (player.dir === 'right') { ctx.translate(player.x * 2, 0); ctx.scale(-1, 1); }
      ctx.drawImage(spriteSheet, frame.x, frame.y, frame.w, frame.h, x, y, width, height);
      ctx.restore();
    } else {
      block(player.x-14,player.y-35,28,25,'#33283e');
      block(player.x-17,player.y-17,34,15,'#703f59');
      block(player.x-11,player.y-49,22,20,'#e1c4bb');
      block(player.x-13,player.y-54,26,11,'#211c2c');
      block(player.x-12,player.y+1,9,12,'#37303e');
      block(player.x+3,player.y+1,9,12,'#37303e');
    }
  }
  function drawChest() {
    block(chest.x-23,chest.y+6,46,9,'#26372f');
    block(chest.x-20,chest.y-19,40,25,chest.opened?'#705d3c':'#9a612b');
    block(chest.x-22,chest.y-24,44,10,chest.opened?'#897048':'#cc913d');
    block(chest.x-4,chest.y-18,8,12,'#f3d16f');
    block(chest.x-14,chest.y-15,28,3,'#e8ae50');
    block(chest.x-18,chest.y-34,36,3,'#f3d16f');
  }
  function drawInn() {
    const x=village.x,y=village.y;
    block(x-66,y+22,132,16,'#354234');
    block(x-55,y-54,110,78,'#c6b38a');
    block(x-64,y-67,128,28,'#8e5148');block(x-48,y-83,96,22,'#aa6150');
    block(x-15,y-26,30,50,'#59403a');block(x-45,y-37,20,18,'#79abc0');block(x+27,y-37,20,18,'#79abc0');
    block(x-4,y-78,8,18,'#ead7aa');block(x+4,y-75,28,6,'#ddc28a');block(x+27,y-70,5,22,'#ddc28a');
    block(x-17,y-12,34,4,'#ad9066');
  }
  function draw() {
    const camX=Math.max(0,Math.min(WORLD_W-W,player.x-W/2)),camY=Math.max(0,Math.min(WORLD_H-H,player.y-H/2));
    ctx.setTransform(.5,0,0,.5,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.translate(-camX,-camY);
    block(0,0,WORLD_W,WORLD_H,'#386247');
    for(let y=0;y<WORLD_H;y+=TILE)for(let x=0;x<WORLD_W;x+=TILE){
      const v=(x*31+y*19)%17;
      if(v<5)block(x+(v%4)*8,y+((v*7)%5)*7,5,5,v===0?'#77a45d':'#4d8052');
      else if(v===9)block(x+18,y+28,3,3,'#a2af64');
    }
    const road=[
      {x:80,y:600},{x:330,y:570},{x:450,y:670},{x:670,y:630},
      {x:820,y:610},{x:840,y:520},{x:1040,y:540},{x:1280,y:565},
      {x:1390,y:450},{x:1730,y:390}
    ];
    for(let i=1;i<road.length;i++){
      const a=road[i-1],b=road[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/45);
      for(let j=0;j<=steps;j++){const t=j/steps,x=Math.round((a.x+(b.x-a.x)*t)/50)*50,y=Math.round((a.y+(b.y-a.y)*t)/50)*50;block(x-58,y-43,116,86,'#ab8c58');block(x-43,y-31,86,62,'#cfb77b');}
    }
    // Rocky ridge and a clear blue pond make the field feel like a place, not a green plane.
    for(let x=100;x<1700;x+=190){const peak=245+(x%4)*12;block(x,peak+62,170,95,'#59656a');block(x+20,peak+28,130,60,'#707b7c');block(x+45,peak,80,55,'#8f9993');block(x+65,peak+2,38,26,'#e2dfcc');block(x+52,peak+26,25,19,'#d5d8cb')}
    for(let y=pond.y-pond.ry-30;y<pond.y+pond.ry+30;y+=25)for(let x=pond.x-pond.rx-30;x<pond.x+pond.rx+30;x+=25){const nx=(x-pond.x)/pond.rx,ny=(y-pond.y)/pond.ry,d=nx*nx+ny*ny;if(d<1.2){block(x,y,26,26,d<.82?((x+y)%3?'#286e82':'#347f91'):((x+y)%2?'#c3ad72':'#d3c082'));if(d<.82&&((x+y)%5===0))block(x+8,y+8,8,3,'#77bdac')}}
    trees.forEach(t=>drawTree(t.x,t.y));
    for(let x=280;x<1480;x+=48){if((x>490&&x<660)||(x>920&&x<1100))continue;block(x,210+(x%3)*3,43,24,'#686d68');block(x+5,213+(x%3)*3,32,7,'#92958a');}
    drawInn();
    for(let i=0;i<44;i++){const fx=95+(i*173)%1580,fy=320+(i*97)%720;if(Math.hypot(fx-player.x,fy-player.y)>95&&Math.hypot(fx-village.x,fy-village.y)>110){block(fx,fy,5,5,['#f2d17c','#f2e5c0','#c9a8d8'][i%3]);block(fx+5,fy+4,3,4,'#376947')}}
    const objects=[
      {y:chest.y,draw:drawChest},
      {y:traveler.y,draw:()=>drawPerson(traveler.x,traveler.y,'traveler','down',0,'村人')},
      {y:summoner.y,draw:()=>drawPerson(summoner.x,summoner.y,'summoner','down',0,'召喚師')},
      {y:slime.y,draw:()=>drawPerson(slime.x,slime.y,'slime','down',0,'')},
      {y:player.y,draw:drawHero}
    ];
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    const nearby=[chest,traveler,summoner,slime].find(o=>Math.hypot(player.x-o.x,player.y-o.y)<100);
    if(nearby){block(player.x-4,player.y-112,8,5,'#f4d483');block(player.x-10,player.y-107,20,4,'#f4d483')}
    ctx.restore();
  }
  let last=0;
  function loop(now){
    const dt=Math.min((now-last)/16.67,2);last=now;
    let dx=0,dy=0;if(held.has('up'))dy--;if(held.has('down'))dy++;if(held.has('left'))dx--;if(held.has('right'))dx++;
    player.moving=Boolean(dx||dy);
    if(player.moving){
      const mag=Math.hypot(dx,dy);dx/=mag;dy/=mag;
      const nx=player.x+dx*3.2*dt,ny=player.y+dy*3.2*dt;
      const blocked=trees.some(t=>Math.hypot(nx-t.x,ny-t.y)<42) || (Math.abs(nx-village.x)<66&&ny>village.y-83&&ny<village.y+36) || (((nx-pond.x)/pond.rx)**2+((ny-pond.y)/pond.ry)**2<.75);
      if(!blocked){player.x=Math.max(35,Math.min(WORLD_W-35,nx));player.y=Math.max(250,Math.min(WORLD_H-30,ny))}
      player.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
      player.step+=.2*dt;
    }else player.step+=.035*dt;
    if(!encounterOverlay.classList.contains('visible')){
      const close=(obj,r=98)=>Math.hypot(player.x-obj.x,player.y-obj.y)<r;
      const target=close(traveler)?'村人と話す':close(summoner,110)?'召喚師と話す':close(slime)?'魔物に挑む':close(chest,105)?'宝箱を開ける':'';
      fieldAction.textContent=target||'調べる';
      if(!storyMet&&close(traveler)){storyMet=true;setObjective('村人の話を聞こう');say('村人「旅人さん、少しお話ししませんか？」');setScreen('story')}
      else if(storyComplete&&!slimeMet&&close(slime)){slimeMet=true;setObjective('森の魔物を倒そう');say('スライムが飛び出した！');setScreen('battle')}
      else if(battleWon&&!summonMet&&close(summoner)){summonMet=true;setObjective('星の仲間を召喚しよう');say('召喚師「星の仲間を呼んでみよう！」');setScreen('gacha')}
    }else fieldAction.textContent='';
    draw();requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
