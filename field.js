(() => {
  let objective;
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
  worldFrame.querySelector('.world-location').textContent='\u5c01\u9396\u3055\u308c\u305f\u53e4\u4ee3\u907a\u8de1';
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
  const prologue = document.createElement('div');
  prologue.className = 'prologue-overlay visible';
  prologue.innerHTML = '<section class="prologue-box"><small>PROLOGUE / NAMELESS SWORDSMAN</small><h2></h2><p></p><button type="button" class="primary">次へ <span>▶</span></button></section>';
  home.append(prologue);
  const opening = [
    ['名もなき剣士', '冷たい石床の上で、あなたは目を覚ました。手には見覚えのない黒い剣。自分の名前も、ここへ来た理由も思い出せない。'],
    ['遺跡の少女', '「……やっと目覚めたんだね」少女はリリアと名乗った。地上では、太陽が黒く染まった災厄『灰の夜』から、すでに300年が過ぎていた。'],
    ['灰喰い', '「あなたは、この世界を滅ぼした存在を倒すために作られた剣士なの」その言葉を遮るように石扉が砕け、魔物が遺跡へなだれ込んだ。黒い剣を握り、戦いに備えよう。']
  ];
  let openingIndex = 0;
  const showOpening = () => {
    prologue.querySelector('h2').textContent = opening[openingIndex][0];
    prologue.querySelector('p').textContent = opening[openingIndex][1];
    prologue.querySelector('button').innerHTML = openingIndex === opening.length - 1 ? '遺跡を進む <span>▶</span>' : '次へ <span>▶</span>';
  };
  showOpening();
  prologue.querySelector('button').addEventListener('click', () => {
    if (++openingIndex < opening.length) showOpening();
    else {
      prologue.classList.remove('visible');
      storyMet = true;
      setObjective('リリアに話しかけ、遺跡の出口を探そう');
      say('リリア「立てる？ この先に出口がある。でも、魔物が近くまで来ているみたい……」');
    }
  });
  const joystick = document.createElement('div');
  joystick.className = 'mobile-joystick'; joystick.setAttribute('aria-label', 'スティックで移動');
  joystick.innerHTML = '<span class="joystick-base"></span><span class="joystick-knob"></span>';
  field.querySelector('.touch-pad').after(joystick);
  const joystickKnob = joystick.querySelector('.joystick-knob');
  const joystickState = {x:0,y:0,pointer:null};
  const resetJoystick = () => { joystickState.x=0; joystickState.y=0; joystickState.pointer=null; joystickKnob.style.transform='translate(-50%,-50%)'; };
  joystick.addEventListener('pointerdown', e => { e.preventDefault(); joystickState.pointer=e.pointerId; joystick.setPointerCapture(e.pointerId); moveJoystick(e); });
  joystick.addEventListener('pointermove', e => { if(joystickState.pointer===e.pointerId) moveJoystick(e); });
  joystick.addEventListener('pointerup', resetJoystick);
  joystick.addEventListener('pointercancel', resetJoystick);
  function moveJoystick(e) {
    const rect=joystick.getBoundingClientRect(), radius=rect.width*.34;
    const dx=e.clientX-(rect.left+rect.width/2), dy=e.clientY-(rect.top+rect.height/2), distance=Math.hypot(dx,dy), scale=distance>radius?radius/distance:1;
    joystickState.x=dx*scale/radius; joystickState.y=dy*scale/radius;
    joystickKnob.style.transform=`translate(calc(-50% + ${dx*scale}px),calc(-50% + ${dy*scale}px))`;
  }
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
      e.preventDefault(); e.stopImmediatePropagation(); storyComplete = true; setObjective('\u907a\u8de1\u306e\u9b54\u7269\u3092\u5012\u305d\u3046'); say('\u77f3\u6249\u304c\u7834\u308c\u3001\u7070\u55b0\u3044\u304c\u8972\u3044\u304b\u304b\u3063\u3066\u304d\u305f\uff01');
      encounterOverlay.classList.remove('visible');
      setObjective('森のスライムを倒そう');
      say('道の先にスライムがいる。近づくと戦闘が始まるよ。');
    }
  }, true);
  const canvas = document.querySelector('#world');
  const ctx = canvas.getContext('2d');
  const message = document.querySelector('#worldMessage');
  const fieldAction = document.querySelector('#fieldAction');
  message.textContent = '\u53e4\u4ee3\u907a\u8de1\u3067\u76ee\u3092\u899a\u307e\u3057\u305f\u3002\u30ea\u30ea\u30a2\u306b\u8fd1\u3065\u3044\u3066\u8a71\u3092\u805e\u3053\u3046\u3002';
  objective = document.createElement('div');
  objective.className = 'quest-hud';
  objective.innerHTML = '<small>CHAPTER 01 / NEXT</small><strong>\u30ea\u30ea\u30a2\u304b\u3089\u8a71\u3092\u805e\u3053\u3046</strong>';
  document.querySelector('.world-frame').append(objective);
  function setObjective(text) { if (objective) objective.querySelector('strong').textContent = text; }
  const W = 1200, H = 675, WORLD_W = 1800, WORLD_H = 1200, TILE = 50;
  canvas.width = 1200;
  canvas.height = 675;
  ctx.imageSmoothingEnabled = false;
  const spriteSheet = new Image();
  spriteSheet.src = 'assets/protagonist-sheet.png?v=chapter1-ash';
  const characterSheet = new Image();
  let characterArt = null;
  characterSheet.src = 'assets/character-sheet.png?v=chapter1-ash';
  characterSheet.addEventListener('load', () => {
    const layer = document.createElement('canvas');
    layer.width = characterSheet.naturalWidth; layer.height = characterSheet.naturalHeight;
    const layerCtx = layer.getContext('2d', {willReadFrequently:true});
    layerCtx.drawImage(characterSheet, 0, 0);
    const pixels = layerCtx.getImageData(0, 0, layer.width, layer.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (pixels.data[i] < 12 && pixels.data[i + 1] < 12 && pixels.data[i + 2] < 12) pixels.data[i + 3] = 0;
    }
    layerCtx.putImageData(pixels, 0, 0);
    characterArt = layer;
    draw();
  });
  spriteSheet.addEventListener('load', () => draw());
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
    {x:130,y:365},{x:310,y:365},{x:510,y:365},{x:135,y:790},{x:320,y:910},
    {x:810,y:370},{x:790,y:900},{x:1210,y:350},{x:1280,y:620},{x:1470,y:430},
    {x:1420,y:900},{x:1690,y:700}
  ];
  let storyMet = false, storyComplete = false, summonMet = false, slimeMet = false, battleWon = false;
  window.addEventListener('rpg-battle-won', () => { battleWon = true; setObjective('\u7070\u306b\u6c88\u3080\u6751\u3067\u751f\u5b58\u8005\u3092\u63a2\u305d\u3046'); say('\u9b54\u7269\u3092\u9000\u3051\u305f\u3002\u907a\u8de1\u306e\u5916\u306b\u306f\u3001\u7070\u306b\u6c88\u3080\u6751\u304c\u5e83\u304c\u3063\u3066\u3044\u308b\u3002'); worldFrame.querySelector('.world-location').textContent='\u7070\u306b\u6c88\u3080\u6751 \u2014 \u7070\u306e\u591c\u304b\u3089300\u5e74'; });
  window.addEventListener('rpg-summoned', () => { setObjective('\u6751\u306f\u305a\u308c\u306e\u5b9d\u7bb1\u304b\u3089\u53e4\u6587\u66f8\u3092\u63a2\u305d\u3046'); });
  const keyMap = {ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  window.addEventListener('keydown', e => {
    if (prologue.classList.contains('visible')) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); prologue.querySelector('button').click(); } return; }
    if (encounterOverlay.classList.contains('visible')) { if (e.key === 'Escape') encounterOverlay.classList.remove('visible'); return; }
    if (keyMap[e.key]) { held.add(keyMap[e.key]); e.preventDefault(); }
    if (e.key === ' ' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') { e.preventDefault(); interact(); }
  });
  window.addEventListener('keyup', e => { if (keyMap[e.key]) held.delete(keyMap[e.key]); });
  window.addEventListener('blur', () => held.clear());
  window.addEventListener('pointerup', e => { if(joystickState.pointer===e.pointerId) resetJoystick(); });
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
      if (!chest.opened) { chest.opened = true; if (typeof save !== 'undefined') { save.crystals += 30; saveGame(); } say(battleWon ? '\u53e4\u6587\u66f8\u3092\u898b\u3064\u3051\u305f\u3002\u7070\u306e\u591c\u306e\u8a18\u9332\u304c\u6b8b\u3055\u308c\u3066\u3044\u308b\u3002 \u661f\u306e\u304b\u3051\u308930\u500b\u3092\u624b\u306b\u5165\u308c\u305f\u3002' : '\u5b9d\u7bb1\u3092\u958b\u3051\u305f\u3002\u661f\u306e\u304b\u3051\u308930\u500b\u3092\u624b\u306b\u5165\u308c\u305f\u3002'); if (battleWon) setObjective('\u7b2c1\u7ae0\u300c\u7070\u306b\u6c88\u3080\u6751\u300d\u5b8c\u4e86'); }
      else say('宝箱は空っぽだ。');
    } else if (near(traveler, 110)) { say('\u30ea\u30ea\u30a2\u300c\u3053\u3053\u306f\u53e4\u4ee3\u907a\u8de1\u3002\u5730\u4e0a\u3067\u306f\u7070\u306e\u591c\u304b\u3089300\u5e74\u304c\u904e\u304e\u305f\u306e\u300d'); setScreen('story'); }
    else if (near(summoner, 115)) { say('\u30ac\u30eb\u30c9\u300c\u6751\u3092\u6551\u3063\u3066\u304f\u308c\u305f\u793c\u306b\u3001\u4ef2\u9593\u3092\u547c\u3076\u8853\u3092\u6559\u3048\u3088\u3046\u300d'); setScreen('gacha'); }
    else if (near(slime, 110)) { say('\u7070\u55b0\u3044\u304c\u9ed2\u3044\u5263\u306b\u53cd\u5fdc\u3057\u3066\u8972\u3044\u304b\u304b\u3063\u3066\u304d\u305f\uff01'); setTimeout(() => setScreen('battle'), 300); }
    else say('夜空には、まだ見ぬ星が輝いている。');
  }
  let messageTimer;
  message.textContent = '\u53e4\u4ee3\u907a\u8de1\u3067\u76ee\u3092\u899a\u307e\u3057\u305f\u3002\u30ea\u30ea\u30a2\u306b\u8fd1\u3065\u3044\u3066\u8a71\u3092\u805e\u3053\u3046\u3002';
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
    const art = kind === 'traveler' ? {x:20,y:90,w:105,h:155} : kind === 'summoner' ? {x:365,y:90,w:105,h:155} : {x:10,y:586,w:85,h:145};
    if (characterArt) {
      const bob = step ? Math.sin(step) * 2 : 0;
      const w = kind === 'traveler' ? 63 : 58, h = kind === 'traveler' ? 94 : 88;
      ctx.drawImage(characterArt, art.x, art.y, art.w, art.h, x-w/2, y-h+bob, w, h);
      if (label) { ctx.font='14px monospace'; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(label,x,y-h-5); }
      return;
    }
    const bob = step ? Math.sin(step) * 2 : 0;
    const colors = kind === 'traveler'
      ? {body:'#44434b',light:'#b8b4b0',head:'#dfcbb6',hair:'#302b34',boots:'#29272e'}
      : kind === 'summoner'
        ? {body:'#4d5147',light:'#9b986e',head:'#c8b39b',hair:'#49413a',boots:'#39342e'}
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
  function drawSlime() {
    const x=slime.x,y=slime.y;
    if (characterArt) { ctx.drawImage(characterArt, 12, 858, 78, 82, x-31, y-58, 62, 66); return; }
    block(x-21,y+9,42,7,'#262b2b');
    block(x-19,y-5,38,16,'#677568');block(x-15,y-13,30,11,'#829080');
    block(x-8,y-18,16,8,'#a2aa91');block(x-4,y-9,4,8,'#d0c7a4');
    block(x-9,y-2,4,5,'#25282a');block(x+6,y-2,4,5,'#25282a');block(x-4,y+5,8,2,'#35312d');
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
    block(x-82,y+27,166,13,'#292b2b');block(x-70,y+20,140,11,'#5c5549');
    block(x-62,y-48,124,72,'#777064');block(x-62,y-48,124,8,'#393534');
    for(let px=x-51;px<x+57;px+=28){block(px,y-39,4,62,'#4c4540');block(px+5,y-5,17,4,'#91836c')}
    block(x-74,y-65,148,28,'#302b2a');block(x-61,y-80,121,19,'#51403a');
    block(x-69,y-64,28,16,'#272729');block(x+34,y-61,29,18,'#292729');block(x-16,y-31,33,57,'#262526');
    block(x-11,y-23,22,50,'#433630');block(x+7,y-6,3,3,'#9b6945');
    block(x-48,y-32,20,20,'#343434');block(x+28,y-30,20,20,'#343434');
    block(x-44,y-28,13,12,'#7d827b');block(x+32,y-26,13,12,'#74766d');
    block(x-5,y-76,10,25,'#5c5144');block(x+5,y-70,28,5,'#706050');
    block(x-88,y-23,24,8,'#75634e');block(x-82,y-15,8,20,'#514436');
    // A single ember still burns under the broken eaves.
    block(x-3,y-17,7,8,'#c16a3c');block(x-1,y-15,3,5,'#e4b46b');
  }
  function drawPillar(x,y) {
    block(x-34,y+24,68,12,'#242729');block(x-27,y-24,54,52,'#373a3b');
    block(x-31,y-28,62,12,'#66645d');block(x-23,y-19,46,9,'#77736a');
    block(x-18,y-12,36,28,'#4c4c48');block(x-11,y-9,6,22,'#5e5c54');
    block(x+9,y-14,6,29,'#383a3a');block(x-25,y+16,49,7,'#343536');
    block(x-31,y-31,12,5,'#898274');block(x+18,y-29,10,4,'#817b6e');
  }
  function drawAncientRuin() {
    block(0,0,WORLD_W,WORLD_H,'#222528');
    for(let y=250;y<WORLD_H;y+=50)for(let x=0;x<WORLD_W;x+=50){
      const k=(x/50*7+y/50*11)%9;
      block(x,y,49,49,k<3?'#41413e':k<6?'#3b3c3a':'#454440');
      block(x+2,y+2,45,2,'#50504b');block(x+2,y+4,2,40,'#484843');
      if(k===0)block(x+34,y+27,8,3,'#343638');
    }
    // The sealed stairway and cracked gate mark the only route into the ruin.
    block(470,236,330,72,'#171a1c');block(490,222,290,26,'#585650');
    for(let y=246;y<320;y+=18){block(520,y,230,8,'#777165');block(530,y+8,210,7,'#454440')}
    block(577,312,116,21,'#242629');block(589,300,92,14,'#8b806d');
    // Broken columns, fallen blocks and ash drifts are authored as separate landmarks.
    trees.forEach(t=>drawPillar(t.x,t.y));
    [[210,515,74,28],[405,845,92,32],[925,790,88,26],[1020,420,56,22],[695,935,80,27],[1510,580,88,31]].forEach(([x,y,w,h])=>{
      block(x,y,w,h,'#2a2c2d');block(x+8,y-5,w-21,h-4,'#57544e');block(x+18,y-9,w-39,6,'#777064');block(x+w-15,y+8,12,7,'#393a39');
    });
    [[190,405],[390,690],[560,480],[850,720],[1080,390],[1240,860],[1460,530],[1620,980]].forEach(([x,y],i)=>{
      block(x,y,8,3,i%3===0?'#bd6943':'#71685a');if(i%3===0)block(x+2,y-4,3,4,'#e1a45e');
    });
    [[90,520],[240,640],[360,470],[470,970],[880,470],[1010,690],[1360,510],[1540,790]].forEach(([x,y],i)=>{
      block(x,y,23,8,'#4b4942');block(x+4,y-5,11,5,'#666056');if(i%2===0)block(x+14,y+4,8,5,'#383938');
    });
  }
  function drawAshVillage() {
    block(0,0,WORLD_W,WORLD_H,'#454542');
    for(let y=250;y<WORLD_H;y+=50)for(let x=0;x<WORLD_W;x+=50){
      const k=(x/50*5+y/50*13)%8;
      block(x,y,49,49,k<3?'#55534d':k<6?'#4c4b47':'#5d574e');
      if(k===1)block(x+8,y+12,17,3,'#69645a');if(k===4)block(x+27,y+33,11,4,'#3d3e3e');
    }
    // A gray road cuts through the burned settlement toward the surviving house.
    const road=[{x:0,y:610},{x:340,y:615},{x:690,y:590},{x:980,y:620},{x:1260,y:580},{x:1560,y:625},{x:1800,y:590}];
    for(const [color,width] of [['#393a39',102],['#706653',82],['#84765d',68]]){
      ctx.beginPath();ctx.moveTo(road[0].x,road[0].y);road.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='square';ctx.lineJoin='round';ctx.stroke();
    }
    [[110,420,104,65],[420,445,132,74],[800,360,110,68],[1380,420,124,80],[1480,810,94,66]].forEach(([x,y,w,h],i)=>{
      block(x,y+h-12,w,h/2,'#343434');block(x-7,y+4,w+14,18,'#292929');
      block(x+12,y,w-23,h/2,'#51483e');block(x+18,y+8,17,31,'#2c2927');
      block(x+15,y+37,w-34,6,'#777064');if(i%2===0)block(x+w-34,y-6,19,17,'#292a2a');
    });
    [[150,333],[360,820],[620,410],[920,900],[1290,500],[1540,710],[1720,360]].forEach(([x,y],i)=>{
      block(x,y,17,5,'#a45e3e');if(i%2===0)block(x+7,y-5,4,5,'#d18b4e');
    });
    trees.forEach(t=>drawPillar(t.x,t.y));
  }
  function draw() {
    const camX=Math.max(0,Math.min(WORLD_W-W,player.x-W/2)),camY=Math.max(0,Math.min(WORLD_H-H,player.y-H/2));
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.translate(-camX,-camY);
    if(battleWon) drawAshVillage(); else drawAncientRuin();
    if(battleWon) drawInn();
    const objects=[
      {y:chest.y,draw:drawChest},
      {y:traveler.y,draw:()=>drawPerson(traveler.x,traveler.y,'traveler','down',0,'\u30ea\u30ea\u30a2')},
      {y:summoner.y,draw:()=>drawPerson(summoner.x,summoner.y,'summoner','down',0,'\u30ac\u30eb\u30c9')},
      {y:slime.y,draw:drawSlime},
      {y:player.y,draw:drawHero},
    ];
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    const nearby=[chest,traveler,summoner,slime].find(o=>Math.hypot(player.x-o.x,player.y-o.y)<100);
    if(nearby){block(player.x-4,player.y-112,8,5,'#f4d483');block(player.x-10,player.y-107,20,4,'#f4d483')}
    ctx.restore();
  }
  let last=0;
  function loop(now){
    const dt=Math.min((now-last)/16.67,2);last=now;
    let dx=joystickState.x,dy=joystickState.y;if(held.has('up'))dy--;if(held.has('down'))dy++;if(held.has('left'))dx--;if(held.has('right'))dx++;
    player.moving=Boolean(dx||dy);
    if(player.moving){
      const mag=Math.hypot(dx,dy);dx/=mag;dy/=mag;
      const nx=player.x+dx*3.2*dt,ny=player.y+dy*3.2*dt;
      const isBlocked=(x,y)=>trees.some(t=>Math.hypot(x-t.x,y-t.y)<42) || (Math.abs(x-village.x)<66&&y>village.y-83&&y<village.y+36);
      if(!isBlocked(nx,player.y)) player.x=Math.max(35,Math.min(WORLD_W-35,nx));
      if(!isBlocked(player.x,ny)) player.y=Math.max(250,Math.min(WORLD_H-30,ny));
      player.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
      player.step+=.2*dt;
    }else player.step+=.035*dt;
    if(!encounterOverlay.classList.contains('visible')){
      const close=(obj,r=98)=>Math.hypot(player.x-obj.x,player.y-obj.y)<r;
      const target=close(traveler)?'\u30ea\u30ea\u30a2\u3068\u8a71\u3059':close(summoner,110)?'\u30ac\u30eb\u30c9\u3068\u8a71\u3059':close(slime)?'\u9b54\u7269\u306b\u6311\u3080':close(chest,105)?'\u53e4\u6587\u66f8\u3092\u8abf\u3079\u308b':'';
      fieldAction.textContent=target||'調べる';
      if(!storyMet&&close(traveler)){storyMet=true;setObjective('\u30ea\u30ea\u30a2\u304b\u3089\u76ee\u899a\u3081\u305f\u7406\u7531\u3092\u805e\u3053\u3046');say('\u30ea\u30ea\u30a2\u300c\u2026\u2026\u3084\u3063\u3068\u76ee\u899a\u3081\u305f\u3093\u3060\u306d\u300d');setScreen('story')}
      else if(storyComplete&&!slimeMet&&close(slime)){slimeMet=true;setObjective('\u907a\u8de1\u306b\u4fb5\u5165\u3057\u305f\u9b54\u7269\u3092\u5012\u305d\u3046');say('\u7070\u55b0\u3044\u304c\u9ed2\u3044\u5263\u306b\u53cd\u5fdc\u3057\u3066\u8972\u3044\u304b\u304b\u3063\u3066\u304d\u305f\uff01');setScreen('battle')}
      else if(battleWon&&!summonMet&&close(summoner)){summonMet=true;setObjective('\u30ac\u30eb\u30c9\u304b\u3089\u6751\u306e\u8a71\u3092\u805e\u3053\u3046');say('\u30ac\u30eb\u30c9\u300c\u7070\u306e\u591c\u304b\u3089300\u5e74\u2026\u2026\u6751\u3092\u5b88\u3063\u3066\u304f\u308c\u305f\u306e\u304b\u300d');setScreen('gacha')}
    }else fieldAction.textContent='';
    draw();requestAnimationFrame(loop);
  }
  draw();
  requestAnimationFrame(loop);
})();
