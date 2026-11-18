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
  hero.remove();
  const worldFrame = field.querySelector('.world-frame');
  const resourceHud = document.querySelector('.resources');
  if (resourceHud) worldFrame.append(resourceHud);
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
  // Hand-placed tree groups frame the paths and landmarks.
  const trees = [
    {x:115,y:310},{x:185,y:285},{x:265,y:325},{x:345,y:295},{x:440,y:330},
    {x:130,y:420},{x:220,y:455},{x:315,y:410},{x:405,y:470},
    {x:1530,y:300},{x:1620,y:335},{x:1710,y:290},{x:1570,y:430},{x:1690,y:455},
    {x:160,y:730},{x:120,y:825},{x:360,y:1010},{x:465,y:960},
    {x:900,y:310},{x:985,y:330},{x:1260,y:310},{x:1370,y:350},
    {x:1450,y:680},{x:1550,y:740},{x:1680,y:690},{x:1420,y:920},{x:1570,y:1010},
    {x:760,y:1030},{x:875,y:1080},{x:1010,y:1030},{x:1280,y:1040}
  ];
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
    // Meadow base with quiet, deliberately grouped grass marks.
    block(0,0,WORLD_W,WORLD_H,'#55784c');
    const meadowPatches = [
      [70,260,350,190,'#5d8051'],[420,250,320,145,'#4e7148'],[780,245,330,175,'#5d8051'],
      [1190,245,270,190,'#4f7048'],[80,500,300,175,'#4f7149'],[440,760,250,180,'#5e8050'],
      [800,850,300,150,'#4f7149'],[1250,540,210,175,'#5e8050'],[1190,900,260,160,'#4f7149']
    ];
    meadowPatches.forEach(([x,y,w,h,c])=>block(x,y,w,h,c));
    // A worn earth lane, laid in broad bends with pale wheel-worn edges.
    const road=[{x:65,y:610},{x:270,y:595},{x:425,y:630},{x:585,y:640},{x:760,y:620},{x:825,y:555},{x:1010,y:560},{x:1170,y:620},{x:1320,y:585},{x:1435,y:485},{x:1730,y:430}];
    for(let i=1;i<road.length;i++){
      const a=road[i-1],b=road[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/34);
      for(let j=0;j<=steps;j++){
        const t=j/steps,x=Math.round((a.x+(b.x-a.x)*t)/25)*25,y=Math.round((a.y+(b.y-a.y)*t)/25)*25;
        block(x-44,y-28,92,58,'#9a8053');block(x-38,y-24,78,48,'#b69a67');
        if((i+j)%3===0) block(x-15+(j%4)*8,y-4,7,5,'#c4aa78');
      }
    }
    // A low, irregular ridge sits beyond the meadow rather than repeating across the horizon.
    [[65,255,170,92],[205,220,205,122],[390,265,170,88],[1260,260,210,95],[1450,225,175,125],[1600,280,160,84]].forEach(([x,y,w,h],i)=>{
      block(x,y+25,w,h,'#465a50');block(x+18,y,w-35,h-18,i%2?'#657769':'#70806d');
      block(x+48,y+13,w-95,h-42,'#87907a');block(x+65,y+17,32,9,'#b3ad8b');
    });
    // Pond with a grassy bank, shallow shore and a small timber landing.
    ctx.fillStyle='#8c8158';ctx.beginPath();ctx.ellipse(pond.x,pond.y,pond.rx+22,pond.ry+17,-.12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#b3a16b';ctx.beginPath();ctx.ellipse(pond.x,pond.y,pond.rx+7,pond.ry+5,-.12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#397b83';ctx.beginPath();ctx.ellipse(pond.x,pond.y,pond.rx-7,pond.ry-9,-.12,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4d9290';ctx.beginPath();ctx.ellipse(pond.x-28,pond.y-24,88,34,-.3,0,Math.PI*2);ctx.fill();
    [[155,850],[198,916],[327,814],[358,886],[245,955]].forEach(([x,y])=>block(x,y,16,5,'#d3c282'));
    block(395,865,92,20,'#74583b');block(403,858,78,10,'#b08a56');
    for(let x=405;x<480;x+=18)block(x,858,4,28,'#604d37');
    // Scattered hand-placed stones along the northern boundary.
    [[275,207],[326,213],[378,204],[430,210],[470,206],[665,208],[712,203],[760,211],[1125,209],[1185,204],[1238,211],[1300,205],[1352,212],[1410,206]].forEach(([x,y],i)=>{
      block(x,y,34,18,'#555f56');block(x+4,y+2,25,6,'#85877a');if(i%2===0)block(x+18,y+10,9,4,'#a09d88');
    });
    drawInn();
    const flowers=[[515,520],[535,535],[554,514],[585,545],[610,530],[720,760],[742,748],[765,770],[785,752],[880,470],[901,480],[923,462],[950,485],[1040,780],[1060,798],[1083,779],[1102,792],[1360,770],[1382,786],[1405,765],[495,880],[515,895],[540,876]];
    flowers.forEach(([x,y],i)=>{block(x,y,5,5,i%3===0?'#f2d17c':i%3===1?'#f2e5c0':'#c9a8d8');block(x+4,y+4,3,4,'#376947')});
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
