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
  canvas.width = 1200;
  canvas.height = 675;
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
  const pond = {x: 960, y: 635, rx: 142, ry: 600};
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
    // Timber inn with stone footing, beam-framed walls, tiled roof and shuttered windows.
    block(x-78,y+28,156,12,'#3f503b');block(x-69,y+23,138,9,'#73624a');
    block(x-62,y-50,124,74,'#d4bd83');block(x-62,y-50,124,9,'#76533a');
    for(let px=x-50;px<x+58;px+=28){block(px,y-40,4,63,'#876342');block(px+5,y-4,17,4,'#c8ac72')}
    block(x-73,y-68,146,29,'#704335');block(x-62,y-83,124,20,'#8d503d');
    for(let px=x-61;px<x+62;px+=18){block(px,y-64,13,5,'#b46d4d');block(px+4,y-54,8,5,'#a55f46')}
    block(x-18,y-31,36,57,'#4a362e');block(x-12,y-25,23,51,'#624438');block(x+10,y-5,3,3,'#e0bc70');
    for(const wx of [x-49,x+30]){block(wx,y-34,21,22,'#583f32');block(wx+3,y-31,15,16,'#77aeb1');block(wx+9,y-31,3,16,'#d4c18c');block(wx+3,y-24,15,3,'#d4c18c');block(wx-4,y-36,5,25,'#986343');block(wx+20,y-36,5,25,'#986343')}
    block(x-5,y-77,11,25,'#d8c99e');block(x+7,y-72,25,5,'#e1cb91');
    block(x-86,y-25,19,26,'#694a34');block(x-90,y-31,27,8,'#9c6947');
    block(x+65,y-5,9,31,'#684832');block(x+55,y-8,32,6,'#c8a264');
    // Bright doorway and flower boxes make the inn easy to spot from the path.
    block(x-7,y-19,14,15,'#e2b762');block(x-3,y-16,7,12,'#f1d487');
    for(const bx of [x-51,x+32]){block(bx,y-6,24,5,'#80523d');block(bx+3,y-11,4,5,'#efb464');block(bx+10,y-13,4,7,'#eddf86');block(bx+17,y-9,4,6,'#f1a276')}
    block(x-16,y+25,32,5,'#a78959');
  }
  function draw() {
    const camX=Math.max(0,Math.min(WORLD_W-W,player.x-W/2)),camY=Math.max(0,Math.min(WORLD_H-H,player.y-H/2));
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.translate(-camX,-camY);
    // Soft, varied meadow colors; foliage is placed in drifts, leaving room to walk.
    block(0,0,WORLD_W,WORLD_H,'#65934e');
    const meadowPatches=[
      [0,260,330,210,'#6b9b54'],[360,240,250,140,'#5d874b'],[640,265,165,220,'#6d9a50'],
      [1110,250,310,180,'#5b874a'],[0,500,290,170,'#5d8949'],[390,785,310,210,'#6c9a50'],
      [690,820,185,250,'#5c8748'],[1100,900,330,190,'#6b984f'],[1390,530,240,185,'#5e894a']
    ];
    meadowPatches.forEach(([x,y,w,h,c])=>block(x,y,w,h,c));
    // Pebbled earth trail bends past the traveler and across a timber bridge.
    const road=[{x:0,y:610},{x:235,y:590},{x:430,y:625},{x:630,y:632},{x:805,y:612},{x:900,y:612},{x:1030,y:612},{x:1180,y:638},{x:1350,y:600},{x:1510,y:505},{x:1800,y:470}];
    for(let i=1;i<road.length;i++){
      const a=road[i-1],b=road[i],steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/19);
      for(let j=0;j<=steps;j++){
        const t=j/steps,x=Math.round((a.x+(b.x-a.x)*t)/12)*12,y=Math.round((a.y+(b.y-a.y)*t)/12)*12;
        block(x-35,y-23,74,49,'#a98854');block(x-30,y-20,64,42,'#c2a466');
        if((i+j)%2===0){block(x-19+(j%4)*8,y-5,6,4,'#d2b677');block(x+13,y+8,4,3,'#92764c')}
      }
    }
    // Water channel, natural banks and reed beds; the bridge is a deliberate crossing.
    ctx.fillStyle='#716f49';ctx.beginPath();ctx.ellipse(pond.x+8,pond.y,pond.rx+38,pond.ry+20,-.015,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#9e9a60';ctx.beginPath();ctx.ellipse(pond.x,pond.y,pond.rx+22,pond.ry+7,-.015,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#27958f';ctx.beginPath();ctx.ellipse(pond.x,pond.y,pond.rx,pond.ry,-.015,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#37aaa0';ctx.beginPath();ctx.ellipse(pond.x-15,pond.y-6,pond.rx-35,pond.ry-12,-.015,0,Math.PI*2);ctx.fill();
    [[836,285],[1080,344],[827,435],[1087,492],[834,738],[1081,810],[845,955],[1078,1030]].forEach(([x,y],i)=>{
      for(let n=0;n<5;n++){const rx=x+(i%2?1:-1)*n*7;block(rx,y+n*5,4,15,'#54804a');block(rx+3,y+n*5,3,12,'#b9b15e')}
    });
    // Bridge deck, plank seams, timber rails and stone approaches.
    [[822,576],[1080,577]].forEach(([x,y])=>{block(x,y,18,48,'#81714c');block(x+2,y+2,13,9,'#b6a16c')});
    block(816,574,288,72,'#684b36');block(824,579,272,60,'#9a6b43');
    for(let x=830;x<1090;x+=24){block(x,581,3,56,'#604632');block(x+4,586,15,4,'#bb8755');block(x+4,626,15,4,'#795437')}
    block(816,570,288,9,'#674731');block(816,641,288,9,'#674731');
    for(let x=830;x<1090;x+=48){block(x,563,8,13,'#654632');block(x+2,562,4,3,'#d0a366');block(x,639,8,13,'#654632')}
    // Low rocks and moss at the northern edge, in irregular groups.
    [[240,215],[284,226],[323,203],[360,221],[402,208],[445,216],[474,203],[620,218],[665,205],[709,220],[750,208],[1200,205],[1246,218],[1300,207],[1352,223],[1390,208],[1444,216],[1490,202]].forEach(([x,y],i)=>{
      block(x,y,28+(i%3)*6,16,'#626c58');block(x+4,y+2,16,5,'#a2a184');block(x+11,y+9,12,4,'#455b49');
      if(i%2===0)block(x+20,y-4,6,5,'#65865a');
    });
    // Hand-placed grass tufts and flower beds, grouped away from the trail.
    const grassBeds=[[70,365,18],[126,470,15],[210,365,22],[330,465,17],[445,320,18],[500,835,20],[580,880,22],[700,360,18],[744,440,16],[1150,345,22],[1210,395,15],[1300,315,18],[1260,835,21],[1380,930,24],[1530,765,20],[1650,370,18],[1630,1000,22]];
    grassBeds.forEach(([x,y,n])=>{for(let i=0;i<n;i++){const gx=x+(i%6)*9,gy=y+Math.floor(i/6)*8;block(gx,gy,3,5,i%3===0?'#8bb75b':i%3===1?'#477b48':'#adc263')}});
    const flowers=[[525,510],[542,529],[566,514],[586,536],[609,519],[720,765],[741,748],[766,771],[788,751],[1156,716],[1174,732],[1192,712],[1250,844],[1270,863],[1294,842],[1460,708],[1480,722],[1502,704],[480,901],[500,916],[530,894],[1330,440],[1350,455],[1373,437]];
    flowers.forEach(([x,y],i)=>{block(x,y,4,4,['#f2d66b','#f3e9c5','#ef8a57','#e6aee2'][i%4]);block(x+3,y+4,3,5,'#397348')});
    drawInn();
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
      const blocked=trees.some(t=>Math.hypot(nx-t.x,ny-t.y)<42) || (Math.abs(nx-village.x)<66&&ny>village.y-83&&ny<village.y+36) || (((nx-pond.x)/pond.rx)**2+((ny-pond.y)/pond.ry)**2<.88 && !(ny>558&&ny<665&&nx>820&&nx<1100));
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
  draw();
  requestAnimationFrame(loop);
})();
