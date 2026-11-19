(() => {
  let objective;
  let characterArt = null;
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
  panel.innerHTML = '<div class="quick-tabs"><button data-quick="story" class="active">\u7269\u8a9e</button><button data-quick="battle">\u6226\u95d8</button><button data-quick="gacha">\u53ec\u559a</button><button data-quick="growth">\u80b2\u6210</button></div><div class="quick-content"><section class="quick-pane" id="quick-story"></section><section class="quick-pane" id="quick-battle"></section><section class="quick-pane" id="quick-gacha"></section><section class="quick-pane growth-pane" id="quick-growth"></section></div>';
  dashboard.append(panel);
  const storySection = document.querySelector('#story');
  const gachaSection = document.querySelector('#gacha');
  const battleSection = document.querySelector('#battle');
  document.querySelector('#quick-story').append(storySection.querySelector('.story-card'));
  document.querySelector('#quick-gacha').append(gachaSection.querySelector('.banner'), gachaSection.querySelector('.summon-actions'), gachaSection.querySelector('#roster'));
  const quickGrowth = document.querySelector('#quick-growth');
  quickGrowth.innerHTML = '<div class="growth-title"><div><small>STATUS / CHAPTER 01</small><h2>\u540d\u3082\u306a\u304d\u5263\u58eb</h2></div><b id="growth-level">Lv.1</b></div><div class="growth-stats"><span>HP <b id="growth-hp">1000</b></span><span>MP <b id="growth-mp">24</b></span><span>\u653b\u6483 <b id="growth-atk">100</b></span><span>\u9b54\u529b <b id="growth-magic">40</b></span><span>\u4f1a\u5fc3\u7387 <b id="growth-crit">0%</b></span><span>\u4f1a\u5fc3\u30c0\u30e1\u30fc\u30b8 <b id="growth-crit-dmg">100%</b></span></div><div class="growth-exp"><div><span>\u7d4c\u9a13\u5024</span><b id="growth-exp-label">0 / 60</b></div><i><span id="growth-exp-bar"></span></i></div><p class="growth-points">\u6280\u80fd\u30dd\u30a4\u30f3\u30c8 <b id="growth-points">0</b>&nbsp;&bull;&nbsp;\u6226\u95d8\u3067\u7d4c\u9a13\u5024\u3092\u5f97\u3066\u30ec\u30d9\u30eb\u30a2\u30c3\u30d7</p><div class="formula-note">\u7269\u7406: \u653b\u6483\u529b \u00d7 \u30b9\u30ad\u30eb\u500d\u7387 \u00d7 \u4f1a\u5fc3\u30c0\u30e1\u30fc\u30b8 - \u76f8\u624b\u306e\u9632\u5fa1\u529b<br>\u9b54\u6cd5: \u9b54\u529b \u00d7 \u9b54\u6cd5\u500d\u7387 \u00d7 \u4f1a\u5fc3\u30c0\u30e1\u30fc\u30b8 - \u76f8\u624b\u306e\u9b54\u6cd5\u9632\u5fa1\u529b<br>\u4f1a\u5fc3\u7387 <span id="growth-formula-crit">0%</span> / \u4f1a\u5fc3\u30c0\u30e1\u30fc\u30b8 <span id="growth-formula-crit-dmg">100%</span></div><h3>\u7fd2\u5f97\u3067\u304d\u308b\u30b9\u30ad\u30eb</h3><div class="skill-list" id="skill-list"></div>';
  function renderGrowthPanel(){
    const s=window.rpgSave;if(!s)return;
    quickGrowth.querySelector('#growth-level').textContent='Lv.'+s.level;
    quickGrowth.querySelector('#growth-hp').textContent=s.maxHp;
    quickGrowth.querySelector('#growth-mp').textContent=s.maxMp;
    quickGrowth.querySelector('#growth-atk').textContent=s.atk;quickGrowth.querySelector('#growth-magic').textContent=s.magic;quickGrowth.querySelector('#growth-crit').textContent=(Math.round(s.critRate*1000)/10)+'%';quickGrowth.querySelector('#growth-crit-dmg').textContent=(Math.round(s.critDamage*1000)/10)+'%';quickGrowth.querySelector('#growth-formula-crit').textContent=(Math.round(s.critRate*1000)/10)+'%';quickGrowth.querySelector('#growth-formula-crit-dmg').textContent=(Math.round(s.critDamage*1000)/10)+'%';
    quickGrowth.querySelector('#growth-exp-label').textContent=s.exp+' / '+s.expNext;
    quickGrowth.querySelector('#growth-exp-bar').style.width=Math.min(100,s.exp/s.expNext*100)+'%';
    quickGrowth.querySelector('#growth-points').textContent=s.skillPoints;
    quickGrowth.querySelector('#skill-list').innerHTML=window.rpgSkills.map(skill=>{
      const learned=s.learnedSkills.includes(skill.id),equipped=s.equippedSkill===skill.id,available=s.level>=skill.level&&s.skillPoints>=skill.points;
      const action=learned?'<button data-equip-skill="'+skill.id+'" '+(equipped?'disabled':'')+'>'+(equipped?'\u88c5\u5099\u4e2d':'\u30bb\u30c3\u30c8')+'</button>':available?'<button data-learn-skill="'+skill.id+'">\u7fd2\u5f97 ('+skill.points+' SP)</button>':'<button disabled>'+(s.level<skill.level?'Lv.'+skill.level+'\u3067\u89e3\u653e':'SP\u4e0d\u8db3')+'</button>';
      return '<article class="skill-card '+(learned?'learned':'locked')+'"><div><strong>'+skill.name+'</strong><small>\u5fc5\u8981Lv '+skill.level+' / '+(skill.type==='magic'?'\u9b54\u6cd5':'\u7269\u7406')+' / MP '+skill.mp+'</small><p>'+skill.desc+'</p></div>'+action+'</article>';
    }).join('');
  }
  quickGrowth.addEventListener('click',e=>{const learn=e.target.closest('[data-learn-skill]'),equip=e.target.closest('[data-equip-skill]');if(learn)window.rpgLearnSkill(learn.dataset.learnSkill);if(equip)window.rpgEquipSkill(equip.dataset.equipSkill);renderGrowthPanel()});
  window.addEventListener('rpg-growth-updated',renderGrowthPanel);renderGrowthPanel();
  const quickBattle = document.querySelector('#quick-battle');
  const battleStage = battleSection.querySelector('.battlefield');
  const battleBottom = battleSection.querySelector('.battle-bottom');
  const battleHero = document.createElement('canvas');
  battleHero.className = 'battle-hero-stand'; battleHero.width = 240; battleHero.height = 300; battleHero.setAttribute('aria-label','主人公');
  battleStage.append(battleBottom,battleHero);
  quickBattle.append(battleSection.querySelector('.battle-head'),battleStage);
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
  prologue.innerHTML = '<section class="prologue-box"><small>CHAPTER 01 / ASHEN VILLAGE</small><div class="dialogue-layout"><canvas class="dialogue-portrait" width="150" height="180" aria-label="話している人物"></canvas><div class="dialogue-copy"><h2></h2><p></p></div></div><button type="button" class="primary">次へ <span>▶</span></button></section>';
  home.append(prologue);
  const opening = [
    ['名もなき剣士', '冷たい石床の上で、あなたは目を覚ました。手には見覚えのない黒い剣。自分の名前も、ここへ来た理由も思い出せない。'],
    ['遺跡の少女', '「……やっと目覚めたんだね」少女はリリアと名乗った。地上では、太陽が黒く染まった災厄『灰の夜』から、すでに300年が過ぎていた。'],
    ['灰喰い', '「あなたは、この世界を滅ぼした存在を倒すために作られた剣士なの」その言葉を遮るように石扉が砕け、魔物が遺跡へなだれ込んだ。黒い剣を握り、戦いに備えよう。']
  ];
  opening[2][0] = 'リリア';
  const chapterDialogues = {
    lilia: [
      ['リリア','歩ける？　あなたは祭壇のそばで眠っていたの。黒い剣だけが、ずっとあなたを待っていたみたいに残されていた。'],
      ['名もなき剣士','俺を知っているのか。どうして、ここにいた？'],
      ['リリア','わからない。私が覚えているのは、あなたを目覚めさせることだけ。地上へ出れば、何か思い出せるかもしれない。'],
      ['リリア','でも、石門の向こうから灰喰いが来る。剣が近づくと、あいつらはひどく興奮するの。気をつけて。']
    ],
    gald: [
      ['ガルド','あの魔物を退けたのはお前か。俺はガルド、城塞騎士団の生き残りだ。'],
      ['名もなき剣士','村はなぜ、こんな姿に？'],
      ['ガルド','灰の夜から三百年。ここは「灰に沈む村」と呼ばれている。人々は食料庫の地下に身を隠しているが、魔物が道を塞いだ。'],
      ['ガルド','村を救うには、まず生存者を集め、教会跡の鐘を鳴らす。鐘の音があれば、地下にいる者たちへ合図を送れる。'],
      ['ガルド','一人では危険だ。星のかけらで仲間を呼べる術を教える。誰を頼るかは、お前が決めろ。']
    ],
    survivor: [
      ['村人','鐘楼へ向かう道に、灰色の鎧を着た大きな魔物がいた。そいつが現れてから、魔物たちが村へ押し寄せたんだ。'],
      ['名もなき剣士','その魔物は、黒い剣を見ていたか？'],
      ['村人','ああ。まるで剣を知っているように、こちらを指さしていた。……頼む、鐘楼の道を取り戻してくれ。']
    ],
    traces: [
      [['村人','この足跡は鐘楼ではなく、古い教会へ続いている。魔物は何かを探していたのかもしれない。']],
      [['リリア','この壁の印……古文書にあった封印と同じ形。鐘楼の地下へ入る鍵になりそう。']],
      [['名もなき剣士','この剣が近づくと、灰が逆巻いている。魔物は俺を追っているんじゃない。剣の中の何かを恐れている。']]
    ],
    elder: [
      ['老婆','教会の地下には、灰の夜より前の記録が隠されている。あの剣を持つ人が来たら渡せと、先祖から言い伝えられてきた。'],
      ['名もなき剣士','俺を待っていた人がいたのか。'],
      ['老婆','待っていたのはあなたではなく、その剣かもしれないね。古文書を読めば、鐘楼の魔物がなぜあなたを狙うのか、手がかりが見つかるだろう。']
    ],
    manuscript: [
      ['リリア','これは灰の夜の記録……「黒き剣は、天より降りた声を断つため鍛えられた」とある。'],
      ['ガルド','神の声を断つ剣だと？　そんなものが本当に存在するなら、騎士団が知らないはずはない。'],
      ['名もなき剣士','この剣を作ったのは誰だ。俺は何者なんだ。'],
      ['リリア','答えはない。でも続きに、鐘楼の封印を解く言葉が記されている。あの魔物を止めれば、村人を助けられる。']
    ],
    bossIntro: [
      ['灰鎧の将','その剣を、まだ持っていたか。三百年経っても、役目を忘れぬとはな。'],
      ['名もなき剣士','俺を知っているのか。お前は何者だ？'],
      ['灰鎧の将','思い出すな。思い出せば、また世界を灰にする。剣を渡せ。村人は見逃してやろう。'],
      ['リリア','信じないで。あいつは、村人を鐘楼に閉じ込めている！'],
      ['灰鎧の将','ならば、ここで終わらせる。']
    ],
    bellGuard: [
      ['ガルド','鐘楼の守りがまだ残っている。あれを倒せば、地下の人たちへ合図を送れる。'],
      ['リリア','鐘が鳴ったら、村の人たちを逃がすの。灰鎧の将は私たちが引きつける。'],
      ['名もなき剣士','やろう。村を、そしてこの剣が隠しているものを確かめる。']
    ],
    ending: [
      ['灰鎧の将','なぜ……剣が、主の声に応えない……'],
      ['ガルド','鐘楼の魔物が倒れたぞ！　地下のみんな、もう出てきていい！'],
      ['老婆','古文書の最後に、まだ一行あるよ。「剣士が目覚めたなら、神々もまた目覚める」……。'],
      ['リリア','この村は救われた。でも、あなたの剣が何のために作られたのかは、まだわからない。'],
      ['名もなき剣士','なら、確かめに行こう。俺の記憶も、この世界で起きたことも。']
    ]
  };
  let openingIndex = 0;
  let activePages = opening, dialogueDone = null;
  const portraitCanvas = prologue.querySelector('.dialogue-portrait');
  const portraitCtx = portraitCanvas.getContext('2d');
  const portraits = {
    '名もなき剣士': {x:680,y:90,w:80,h:150}, 'リリア': {x:20,y:90,w:105,h:155}, 'ガルド': {x:365,y:90,w:105,h:155},
    '村人': {x:10,y:586,w:82,h:145}, '老婆': {x:1060,y:586,w:112,h:145}, '灰喰い': {x:10,y:858,w:80,h:82}, '灰鎧の将': {x:680,y:90,w:90,h:155}
  };
  function drawSpeaker(name) {
    portraitCtx.clearRect(0,0,150,180);
    const crop=portraits[name]||portraits['村人'];
    if(characterArt) portraitCtx.drawImage(characterArt,crop.x,crop.y,crop.w,crop.h,8,0,134,166);
  }
  function syncStoryPortrait() {
    const canvas=document.querySelector('#storyPortrait');
    if(!canvas||!characterArt)return;
    const title=document.querySelector('#storyTitle')?.textContent||'';
    const speaker=title.includes('リリア')||title.includes('侵入')?'リリア':'名もなき剣士';
    const crop=portraits[speaker];
    const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.drawImage(characterArt,crop.x,crop.y,crop.w,crop.h,0,0,canvas.width,canvas.height);
    const name=document.querySelector('#storySpeaker');if(name)name.textContent=speaker;
  }
  function playDialogue(pages, done) { activePages=pages; openingIndex=0; dialogueDone=done||null; showOpening(); prologue.classList.add('visible'); held.clear(); }
  const showOpening = () => {
    const page=activePages[openingIndex];
    prologue.querySelector('h2').textContent=page[0];
    prologue.querySelector('p').textContent=page[1];
    drawSpeaker(page[0]);
    prologue.querySelector('button').innerHTML=openingIndex===activePages.length-1?'進む <span>▶</span>':'次へ <span>▶</span>';
  };
  showOpening();
  prologue.querySelector('button').addEventListener('click', () => {
    if (++openingIndex < activePages.length) showOpening();
    else {
      prologue.classList.remove('visible');
      const done=dialogueDone; dialogueDone=null; activePages=opening;
      if(done) done();
      else { storyMet=true; chapterStage=1; setObjective('リリアに話しかけ、遺跡の出口を探そう'); say('リリア「立てる？ この先に出口がある。でも、魔物が近くまで来ているみたい……」'); }
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
    const chosen = ['gacha','battle','growth'].includes(id) ? id : 'story';
    quickPanes.forEach(p => p.classList.toggle('active', p.id === 'quick-' + chosen));
    document.querySelectorAll('[data-quick]').forEach(b => b.classList.toggle('active', b.dataset.quick === chosen));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.screen === chosen));
    if (open) { held.clear(); encounterOverlay.classList.add('visible'); }
    encounterOverlay.classList.toggle('battle-open',chosen==='battle');
    if(chosen==='story')syncStoryPortrait();
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
  const minimap = document.createElement('canvas');
  minimap.className = 'world-minimap'; minimap.width = 220; minimap.height = 142;
  minimap.setAttribute('aria-label','現在地と目的地のミニマップ');
  const miniCtx = minimap.getContext('2d');
  document.querySelector('.world-frame').append(minimap);
  const message = document.querySelector('#worldMessage');
  const fieldAction = document.querySelector('#fieldAction');
  message.textContent = '\u53e4\u4ee3\u907a\u8de1\u3067\u76ee\u3092\u899a\u307e\u3057\u305f\u3002\u30ea\u30ea\u30a2\u306b\u8fd1\u3065\u3044\u3066\u8a71\u3092\u805e\u3053\u3046\u3002';
  objective = document.createElement('div');
  objective.className = 'quest-hud';
  objective.innerHTML = '<small>CHAPTER 01 / NEXT</small><strong>\u30ea\u30ea\u30a2\u304b\u3089\u8a71\u3092\u805e\u3053\u3046</strong>';
  document.querySelector('.world-frame').append(objective);
  function setObjective(text) { if (objective) objective.querySelector('strong').textContent = text; }
  const levelHud = document.createElement('div');levelHud.className='hero-progress';levelHud.innerHTML='<b>Lv.<span id="field-level">1</span></b><div><i><span id="field-exp-bar"></span></i><small id="field-exp">0 / 60 EXP</small></div><span class="hero-stats">HP <b id="field-hp">120</b> / ATK <b id="field-atk">32</b> / MAG <b id="field-magic">20</b></span>';
  document.querySelector('.world-frame').append(levelHud);
  function refreshLevelHud(){const s=window.rpgSave;if(!s)return;levelHud.querySelector('#field-level').textContent=s.level;levelHud.querySelector('#field-exp').textContent=s.exp+' / '+s.expNext+' EXP';levelHud.querySelector('#field-exp-bar').style.width=Math.min(100,s.exp/s.expNext*100)+'%';levelHud.querySelector('#field-hp').textContent=s.maxHp;levelHud.querySelector('#field-atk').textContent=s.atk;levelHud.querySelector('#field-magic').textContent=s.magic;}
  window.addEventListener('rpg-growth-updated',refreshLevelHud);refreshLevelHud();
  const W = 1200, H = 675, WORLD_W = 4200, WORLD_H = 2700, TILE = 50;
  canvas.width = 1200;
  canvas.height = 675;
  ctx.imageSmoothingEnabled = false;
  const spriteSheet = new Image();
  spriteSheet.src = 'assets/protagonist-sheet.png?v=chapter1-ash';
  const characterSheet = new Image();
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
    window.characterArt = layer;
    drawSpeaker(activePages[openingIndex][0]);
    syncStoryPortrait();
    draw();
  });
  spriteSheet.addEventListener('load', () => draw());
  spriteSheet.addEventListener('load', () => { window.protagonistSheet=spriteSheet; window.dispatchEvent(new Event('rpg-battle-art-ready')); });
  spriteSheet.addEventListener('error', () => console.error('主人公スプライトを読み込めませんでした。'));

  const player = {x: 570, y: 590, dir: 'down', step: 0, moving: false};
  const traveler = {x: 690, y: 565};
  const chest = {x: 760, y: 730, opened: false};
  const slime = {x: 1070, y: 545};
  const village = {x: 1160, y: 770};
  const summoner = {x: 1110, y: 840};
  const witness = {x: 1320, y: 610};
  const elder = {x: 1430, y: 770};
  const roadGuard = {x: 1570, y: 970};
  const bellGuard = {x: 1480, y: 930};
  const chapterBoss = {x: 1640, y: 1010};
  const clueSites = [{x:1240,y:720,found:false},{x:1420,y:650,found:false},{x:1500,y:800,found:false}];
  const pond = {x: 960, y: 635, rx: 142, ry: 600};
  const held = new Set();
  // Hand-placed tree groups frame the paths and landmarks.
  const trees = [
    {x:130,y:365},{x:310,y:365},{x:510,y:365},{x:135,y:790},{x:320,y:910},
    {x:810,y:370},{x:790,y:900},{x:1210,y:350},{x:1280,y:620},{x:1470,y:430},
    {x:1420,y:900},{x:1690,y:700}
  ];
  const forestTrees=[];
  for(let gx=2800;gx<3500;gx+=108)for(let gy=300;gy<2580;gy+=112){
    const seed=(gx*17+gy*29)%23,roadY=gx<3300?610+(gx-1800)*.22:780-(gx-3300)*.04;
    if(seed<5||Math.abs(gy-roadY)<145)continue;
    forestTrees.push({x:gx+(seed%31)-15,y:gy+((seed*7)%35)-17,size:.78+(seed%5)*.12});
  }
  let storyMet = false, storyComplete = false, summonMet = false, slimeMet = false, battleWon = false, chapterStage = 0, pendingClue = -1;
  window.addEventListener('rpg-battle-won', e => {
    const key=e.detail?.key||'gate'; battleWon=true;
    if(key==='gate'){chapterStage=3;traveler.x=1010;traveler.y=730;setObjective('ガルドに村の状況を聞こう');worldFrame.querySelector('.world-location').textContent='灰に沈む村 — 灰の夜から300年';say('魔物を退けた。石扉の向こうには、灰に沈む村が広がっている。');}
    else if(key==='road'){chapterStage=6;setObjective('老婆から古文書の場所を聞こう');say('鐘楼への道を取り戻した。村の老婆が、教会跡で待っている。');}
    else if(key==='ambush'){if(pendingClue>=0)clueSites[pendingClue].found=true;chapterStage=4.1;pendingClue=-1;if(clueSites.every(o=>o.found)){chapterStage=5;setObjective('鐘楼への道を塞ぐ魔物を倒そう');say('三つの手がかりを守る魔物を退けた。鐘楼への道が見えた。');}else setObjective('残りの手がかりを探そう（'+clueSites.filter(o=>!o.found).length+'つ）');}
    else if(key==='bellGuard'){chapterStage=8.5;setObjective('鐘楼の頂上へ向かおう');say('守りの魔物が倒れ、鐘楼の扉が開いた。');}
    else if(key==='chapterBoss'){chapterStage=10;setObjective('第1章「灰に沈む村」完');playDialogue(chapterDialogues.ending,()=>{if(typeof save!=='undefined'){save.storyDone=true;saveGame();}});}
  });
  let encounterCooldownUntil = 0;
  window.addEventListener('rpg-battle-close', () => {
    encounterOverlay.classList.remove('visible');
    held.clear(); resetJoystick();
    encounterCooldownUntil=Date.now()+15000;
    draw();
  });
  window.addEventListener('rpg-summoned', () => { setObjective('村人の話を聞き、鐘楼への道を探そう'); });
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
  function beginBattle(key) { window.nextEncounterKey=key; say(key==='chapterBoss'?'\u7070\u9396\u306e\u5c06\u304c\u5927\u5263\u3092\u69cb\u3048\u305f\uff01':'\u9b54\u7269\u304c\u884c\u304f\u624b\u3092\u585e\u3044\u3060\uff01'); setTimeout(()=>setScreen('battle'),220); }
  function interact() {
    const near=(obj,range=100)=>Math.hypot(player.x-obj.x,player.y-obj.y)<range;
    if(near(traveler,115)&&chapterStage===1){playDialogue(chapterDialogues.lilia,()=>{storyComplete=true;chapterStage=2;setObjective('\u77f3\u6249\u306e\u524d\u306b\u3044\u308b\u7070\u55b0\u3044\u3092\u5012\u305d\u3046');say('\u7825\u3051\u305f\u77f3\u6249\u306e\u5965\u3067\u3001\u7070\u3092\u307e\u3068\u3063\u305f\u9b54\u7269\u304c\u3046\u3054\u3081\u3044\u3066\u3044\u308b\u3002');});}
    else if(near(summoner,125)&&chapterStage===3&&!summonMet){summonMet=true;playDialogue(chapterDialogues.gald,()=>{chapterStage=4;setObjective('\u751f\u5b58\u8005\u304b\u3089\u9418\u697c\u306e\u8a71\u3092\u805e\u3053\u3046');selectQuick('gacha');});}
    else if(near(witness,115)&&chapterStage===4){playDialogue(chapterDialogues.survivor,()=>{chapterStage=4.1;setObjective('村の周辺で鐘楼へ続く手がかりを3つ探そう');});}
    else if(chapterStage===4.1&&clueSites.some(o=>near(o,90))){const i=clueSites.findIndex(o=>near(o,90)&&!o.found);if(i>=0){playDialogue(chapterDialogues.traces[i],()=>{pendingClue=i;chapterStage=4.2;beginBattle('ambush');});}else say('この場所はもう調べた。');}
    else if(near(roadGuard,120)&&chapterStage===5&&Date.now()>=encounterCooldownUntil){chapterStage=5.5;beginBattle('road');}
    else if(near(elder,115)&&chapterStage===6){playDialogue(chapterDialogues.elder,()=>{chapterStage=7;setObjective('\u6559\u4f1a\u8de1\u306e\u5b9d\u7bb1\u304b\u3089\u53e4\u6587\u66f8\u3092\u898b\u3064\u3051\u3088\u3046');});}
    else if(near(chest,105)&&chapterStage===7&&!chest.opened){chest.opened=true;if(typeof save!=='undefined'){save.crystals+=30;saveGame();}playDialogue(chapterDialogues.manuscript,()=>{chapterStage=8;setObjective('鐘楼の守りを破って、頂上を目指そう');});}
    else if(near(chest,105)&&chapterStage<7)say('\u53e4\u3044\u5b9d\u7bb1\u3060\u3002\u4eca\u306f\u6751\u4eba\u3092\u52a9\u3051\u3001\u6559\u4f1a\u306e\u8a18\u9332\u3092\u63a2\u3059\u306e\u304c\u5148\u3060\u3002');
    else if(near(bellGuard,125)&&chapterStage===8){chapterStage=8.2;playDialogue(chapterDialogues.bellGuard,()=>beginBattle('bellGuard'));}
    else if(near(chapterBoss,130)&&chapterStage===8.5){chapterStage=9.5;playDialogue(chapterDialogues.bossIntro,()=>beginBattle('chapterBoss'));}
    else if(near(traveler,115)&&chapterStage>1)say('\u30ea\u30ea\u30a2\u300c\u3053\u306e\u5263\u306b\u53cd\u5fdc\u3057\u3066\u3044\u308b\u9b54\u7269\u304c\u3044\u308b\u3002\u6c17\u3092\u3064\u3051\u3066\u300d');
    else if(near(summoner,125)&&chapterStage>3)say('\u30ac\u30eb\u30c9\u300c\u9418\u697c\u3078\u306e\u9053\u3092\u53d6\u308a\u623b\u305b\u3002\u751f\u5b58\u8005\u304c\u5730\u4e0b\u306b\u3044\u308b\u300d');
    else if(near(slime,110)&&chapterStage===2){slimeMet=true;chapterStage=2.5;beginBattle('gate');}
    else say('\u7070\u306b\u8986\u308f\u308c\u305f\u907a\u8de1\u3060\u3002\u8db3\u5143\u306b\u6c17\u3092\u3064\u3051\u3066\u9032\u3082\u3046\u3002');
  }
  let messageTimer;
  function say(text) {
    message.textContent=text;
    message.classList.add('visible');
    clearTimeout(messageTimer);
    messageTimer=setTimeout(()=>message.classList.remove('visible'),3600);
  }
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
    const art = kind === 'traveler' ? {x:20,y:90,w:105,h:155} : kind === 'summoner' ? {x:365,y:90,w:105,h:155} : kind === 'elder' ? {x:1055,y:586,w:120,h:145} : {x:10,y:586,w:85,h:145};
    if (characterArt) {
      const bob = step ? Math.sin(step) * 2 : 0;
      const w = kind === 'traveler' ? 63 : kind === 'elder' ? 64 : 58, h = kind === 'traveler' ? 94 : kind === 'elder' ? 84 : 88;
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
  function drawMonsterAt(obj, boss=false) {
    if(characterArt){const r=boss?{x:560,y:830,w:132,h:145}:{x:275,y:830,w:100,h:125};ctx.drawImage(characterArt,r.x,r.y,r.w,r.h,obj.x-(boss?43:34),obj.y-(boss?105:80),boss?86:68,boss?105:80);}
    else drawSlime();
    ctx.font='14px monospace';ctx.textAlign='center';ctx.fillStyle='#f4e5cc';ctx.fillText(boss?'灰鎧の将':'鐘楼の番兵',obj.x,obj.y-(boss?110:86));
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
  function drawForestTree(t){
    const {x,y,size}=t,b=(ox,oy,w,h,c)=>block(Math.round(x+ox*size),Math.round(y+oy*size),Math.max(2,Math.round(w*size)),Math.max(2,Math.round(h*size)),c);
    b(-30,14,61,12,'#26382c');b(-7,-7,15,33,'#65482f');b(-33,-35,67,33,'#27492f');
    b(-27,-48,54,25,'#315b35');b(-17,-61,35,22,'#3b693d');
    b(-20,-45,13,8,'#527e42');b(9,-31,12,9,'#527a3c');b(-6,-59,8,7,'#648849');
    b(20,-18,8,5,'#d1a04c');
  }
  function drawAncientRuin(camX=0,camY=0) {
    block(0,0,WORLD_W,WORLD_H,'#222528');
    for(let y=Math.max(250,Math.floor(camY/TILE)*TILE);y<Math.min(WORLD_H,camY+H+TILE);y+=TILE)for(let x=Math.max(0,Math.floor(camX/TILE)*TILE);x<Math.min(900,camX+W+TILE);x+=TILE){
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
  function drawAshVillage(camX=0,camY=0) {
    block(0,0,WORLD_W,WORLD_H,'#393b35');
    // Tile colors shift from burned village earth into green forest and wet lowlands.
    const x0=Math.max(0,Math.floor(camX/42)*42),x1=Math.min(WORLD_W,camX+W+84);
    const y0=Math.max(250,Math.floor(camY/38)*38),y1=Math.min(WORLD_H,camY+H+76);
    for(let y=y0;y<y1;y+=38)for(let x=x0;x<x1;x+=42){
      const n=(x*17+y*31)%19;
      const palette=y>1950||x>3500?['#52665c','#485b52','#5a6a5c','#43584f']:x>2750?['#526b43','#465d3c','#5c7046','#3d5539']:['#555346','#46483d','#4b493e','#5c5749'];
      if(n<6)block(x+(n*3)%17,y+(n*5)%13,19+n,5,palette[n%palette.length]);
      if(n===8||n===13){block(x+8,y+17,4,3,'#a45b38');if(n===8)block(x+9,y+13,2,4,'#d18b4e');}
      if(n===10)block(x+20,y+5,13,4,x>2750?'#344731':'#272a28');
      if(x>2750&&n===16){block(x+17,y+18,4,5,'#d4c06a');block(x+15,y+22,8,2,'#556d3d');}
      if((y>1950||x>3500)&&n===7){block(x+31,y+9,3,18,'#6f7d53');block(x+27,y+8,10,3,'#819060');}
    }
    // Packed earth road runs through the settlement to the shelter.
    const road=[{x:0,y:610},{x:340,y:615},{x:690,y:590},{x:980,y:620},{x:1260,y:580},{x:1560,y:625},{x:2050,y:600},{x:2420,y:650},{x:2800,y:630},{x:3100,y:690},{x:3300,y:730},{x:3500,y:760},{x:3800,y:710},{x:4200,y:720}];
    for(const [color,width] of [['#292c29',106],['#706047',86],['#8a7650',66]]){
      ctx.beginPath();ctx.moveTo(road[0].x,road[0].y);road.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='square';ctx.lineJoin='round';ctx.stroke();
    }
    [[110,420,104,65],[420,445,132,74],[800,360,110,68],[1380,420,124,80],[1480,810,94,66],[1960,405,138,78],[2290,780,124,74],[2540,395,118,68],[3010,470,116,68],[3750,970,130,74]].forEach(([x,y,w,h],i)=>{
      block(x-5,y+h-9,w+10,12,'#292b28');block(x+5,y+4,w-10,h-7,i%2?'#574536':'#59483a');
      block(x-10,y+1,w+20,15,'#302b28');
      for(let px=x-4;px<x+w;px+=19)block(px,y+18,4,h-24,'#382f29');
      block(x+Math.floor(w*.43),y+34,20,h-34,'#282624');
      block(x+12,y+25,18,15,'#777165');block(x+15,y+28,12,9,'#b16b43');
      if(i%2===0){block(x+w-27,y-8,14,28,'#34312b');block(x+w-24,y-14,8,8,'#574536');}
    });
    [[150,333],[360,820],[620,410],[920,900],[1290,500],[1540,710],[1720,360]].forEach(([x,y],i)=>{
      block(x,y,17,5,'#a45e3e');if(i%2===0)block(x+7,y-5,4,5,'#d18b4e');
    });
    // Charred trees have broken trunks and bare branches, unlike the ruin columns.
    [[190,365],[350,845],[650,390],[920,890],[1270,455],[1580,735],[1710,345],[760,970],[1850,980],[2160,360],[2500,1040],[2690,450]].forEach(([x,y],i)=>{
      block(x-15,y+16,34,8,'#292925');block(x-5,y-23,12,43,'#342d27');
      block(x-15,y-15,12,5,'#44372d');block(x+5,y-8,15,5,'#44372d');
      block(x-19,y-20,8,4,'#39332b');if(i%2===0)block(x+8,y-17,8,4,'#3b332c');
    });
    // A dry well, abandoned cart and ash-covered fields give the outskirts landmarks.
    [[1880,720],[2360,930]].forEach(([x,y])=>{block(x-40,y+10,82,12,'#292a26');block(x-32,y-18,65,30,'#665744');block(x-25,y-12,51,20,'#262b28');block(x-35,y-24,72,7,'#927957');});
    [[2050,1120],[2110,1120],[2170,1120],[2230,1120],[2290,1120]].forEach(([x,y],i)=>{block(x,y,11,37,i%2?'#756139':'#93804b');block(x+3,y-5,5,8,'#c4a75d');});
    // Graveyard stones and a weather-beaten shrine mark the southern woodland path.
    [[2140,1940],[2190,1910],[2250,1960],[2310,1925],[2370,1970],[2440,1930]].forEach(([x,y],i)=>{block(x-13,y+10,27,7,'#343a37');block(x-9,y-13,18,24,i%2?'#898a7b':'#737d70');block(x-4,y-19,8,7,'#a0a18d');block(x-2,y-8,4,12,'#525b50');});
    block(2860,1240,105,20,'#3d3c32');block(2870,1165,82,78,'#655847');block(2862,1153,98,24,'#332e29');block(2897,1190,28,52,'#262624');block(2889,1184,45,8,'#c2a25b');
    block(3860,505,94,14,'#292a27');block(3870,425,74,83,'#55594f');block(3862,413,90,18,'#8a826b');block(3895,450,24,58,'#292b28');
  }
  function drawRiverAndBridge(){
    ctx.beginPath();ctx.moveTo(3475,250);ctx.lineTo(3425,520);ctx.lineTo(3445,770);ctx.lineTo(3380,1050);ctx.lineTo(3410,1370);ctx.lineTo(3330,1690);ctx.lineTo(3360,1980);ctx.lineTo(3260,2280);ctx.lineTo(3300,2650);ctx.strokeStyle='#344039';ctx.lineWidth=176;ctx.lineJoin='round';ctx.stroke();
    ctx.beginPath();ctx.moveTo(3475,250);ctx.lineTo(3425,520);ctx.lineTo(3445,770);ctx.lineTo(3380,1050);ctx.lineTo(3410,1370);ctx.lineTo(3330,1690);ctx.lineTo(3360,1980);ctx.lineTo(3260,2280);ctx.lineTo(3300,2650);ctx.strokeStyle='#318f89';ctx.lineWidth=132;ctx.lineJoin='round';ctx.stroke();
    for(let i=0;i<16;i++){const x=3330+(i*67)%200,y=340+i*145;block(x,y,18,3,'#75b8a1');block(x+5,y+4,7,2,'#b4c185');}
    // Timber bridge crosses the river where the east road continues.
    block(3330,688,205,96,'#30291f');block(3340,695,185,80,'#795434');
    for(let x=3348;x<3520;x+=22){block(x,698,5,73,'#4f3928');block(x+6,701,3,67,'#a37a4d');}
    block(3324,684,12,103,'#483526');block(3526,684,12,103,'#483526');block(3320,679,220,9,'#b18b58');block(3320,782,220,9,'#4b3828');
  }
  function drawMarshPools(){
    [[3700,410,170,86],[3860,1250,205,112],[3670,2050,185,96]].forEach(([x,y,w,h],i)=>{
      block(x-8,y+8,w+16,h-12,'#394a42');block(x,y,w,h,'#387b75');block(x+12,y+8,w-24,h-18,'#45968a');
      block(x+24,y+17,34,4,'#8ab69b');block(x+79,y+31,23,4,'#76af9e');block(x+w-43,y+h-23,29,4,'#8ab69b');
      for(let r=0;r<5;r++){const rx=x-15+((r*53+i*29)%(w+30));const ry=y-13+((r*31+i*17)%(h+26));block(rx,ry,4,16,'#727f50');block(rx-5,ry-2,13,4,'#9b9b5c');}
    });
    // A half-sunken skiff rests in the eastern reeds.
    block(3950,1540,112,20,'#403125');block(3970,1524,74,18,'#825934');block(3982,1517,50,8,'#b28653');block(4000,1488,5,36,'#644933');
  }
  function drawForestTrail(){
    // Fallen trunks, stones, pale mushrooms and flower patches make small clearings readable.
    [[2920,1040],[3140,1320],[2780,1690],[3500,1110],[3720,1540],[3960,2040]].forEach(([x,y],i)=>{block(x-28,y+8,65,11,'#27382c');block(x-22,y,52,8,i%2?'#70513a':'#614831');block(x-17,y-4,11,4,'#897052');});
    [[3060,400],[3190,1090],[3660,1250],[3800,1800],[2860,2150],[3930,2380]].forEach(([x,y],i)=>{block(x,y,7,5,'#e1d49a');block(x+6,y+3,4,4,'#ac6974');block(x-5,y+6,18,3,i%2?'#667b4d':'#74844c');});
    // A small campsite sits beside the south trail.
    block(2670,1780,72,10,'#38332b');block(2681,1748,10,34,'#79523a');block(2721,1748,10,34,'#79523a');block(2678,1741,65,12,'#6d4935');block(2691,1760,31,15,'#d18443');block(2701,1753,12,12,'#f3be64');
  }
  function draw() {
    const camX=Math.max(0,Math.min(WORLD_W-W,player.x-W/2)),camY=Math.max(0,Math.min(WORLD_H-H,player.y-H/2));
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.save();ctx.translate(-camX,-camY);
    drawAshVillage(camX,camY);drawMarshPools();drawRiverAndBridge();drawForestTrail();
    ctx.save();ctx.beginPath();ctx.rect(0,250,900,WORLD_H-250);ctx.clip();drawAncientRuin(camX,camY);ctx.restore();
    // The old processional road leaves the ruin gate and joins the village road.
    ctx.beginPath();ctx.moveTo(635,320);ctx.lineTo(700,395);ctx.lineTo(835,470);ctx.lineTo(970,525);ctx.lineTo(1070,555);ctx.lineTo(1190,600);ctx.strokeStyle='#292c29';ctx.lineWidth=106;ctx.lineCap='square';ctx.lineJoin='round';ctx.stroke();
    ctx.beginPath();ctx.moveTo(635,320);ctx.lineTo(700,395);ctx.lineTo(835,470);ctx.lineTo(970,525);ctx.lineTo(1070,555);ctx.lineTo(1190,600);ctx.strokeStyle='#806d48';ctx.lineWidth=66;ctx.lineCap='square';ctx.lineJoin='round';ctx.stroke();
    if(battleWon) drawInn();
    const objects=[
      {y:chest.y,draw:drawChest},
      {y:traveler.y,draw:()=>drawPerson(traveler.x,traveler.y,'traveler','down',0,'\u30ea\u30ea\u30a2')},
      {y:summoner.y,draw:()=>drawPerson(summoner.x,summoner.y,'summoner','down',0,'\u30ac\u30eb\u30c9')},
      ...(battleWon?[{y:witness.y,draw:()=>drawPerson(witness.x,witness.y,'villager','down',0,'生存者')},{y:elder.y,draw:()=>drawPerson(elder.x,elder.y,'elder','down',0,'老婆')}]:[]),
      ...(chapterStage>=5&&chapterStage<8&&Date.now()>=encounterCooldownUntil?[{y:roadGuard.y,draw:()=>drawMonsterAt(roadGuard)}]:[]),
      ...(chapterStage>=8&&chapterStage<8.2?[{y:bellGuard.y,draw:()=>drawMonsterAt(bellGuard)}]:[]),
      ...(chapterStage>=8.5&&chapterStage<10?[{y:chapterBoss.y,draw:()=>drawMonsterAt(chapterBoss,true)}]:[]),
      ...clueSites.filter(o=>chapterStage===4.1&&!o.found).map(o=>({y:o.y+4,draw:()=>{block(o.x-8,o.y-8,16,16,'#c89457');block(o.x-3,o.y-3,6,6,'#f2d8a2');}})),
      ...forestTrees.map(t=>({y:t.y,draw:()=>drawForestTree(t)})),
      ...(chapterStage<=2?[{y:slime.y,draw:drawSlime}]:[]),
      {y:player.y,draw:drawHero},
    ];
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    const questTarget=getQuestTarget();
    if(questTarget){
      const pulse=5+Math.sin(performance.now()/170)*2;
      ctx.fillStyle='#f5d87a';ctx.beginPath();ctx.arc(questTarget.x,questTarget.y-92,pulse+7,0,Math.PI*2);ctx.fill();
      block(questTarget.x-2,questTarget.y-88,4,36,'#f5d87a');
      ctx.fillStyle='#fff2b1';ctx.beginPath();ctx.moveTo(questTarget.x,questTarget.y-107);ctx.lineTo(questTarget.x+8,questTarget.y-96);ctx.lineTo(questTarget.x,questTarget.y-86);ctx.lineTo(questTarget.x-8,questTarget.y-96);ctx.closePath();ctx.fill();
      ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#1b211d';ctx.strokeText('目的地',questTarget.x,questTarget.y-116);ctx.fillStyle='#fff2b1';ctx.fillText('目的地',questTarget.x,questTarget.y-116);ctx.textAlign='start';
    }
    const nearby=[chest,traveler,summoner,witness,elder,roadGuard,bellGuard,chapterBoss,slime,...clueSites.filter(o=>!o.found)].find(o=>Math.hypot(player.x-o.x,player.y-o.y)<110);
    if(nearby){block(player.x-4,player.y-112,8,5,'#f4d483');block(player.x-10,player.y-107,20,4,'#f4d483')}
    ctx.restore();drawMinimap(camX,camY);
  }
  function getQuestTarget(){
    if(chapterStage<=1)return traveler;
    if(chapterStage===2||chapterStage===2.5)return slime;
    if(chapterStage===3||chapterStage===4)return chapterStage===3?summoner:witness;
    if(chapterStage===4.1)return clueSites.find(o=>!o.found)||witness;
    if(chapterStage===4.2)return clueSites[pendingClue]||roadGuard;
    if(chapterStage===5||chapterStage===5.5)return roadGuard;
    if(chapterStage===6)return elder;
    if(chapterStage===7)return chest;
    if(chapterStage===8||chapterStage===8.2)return bellGuard;
    if(chapterStage===8.5||chapterStage===9.5)return chapterBoss;
    return null;
  }
  function drawMinimap(camX,camY){
    const m=miniCtx,sx=minimap.width/WORLD_W,sy=minimap.height/WORLD_H;
    m.clearRect(0,0,minimap.width,minimap.height);m.fillStyle='#242923';m.fillRect(0,0,minimap.width,minimap.height);
    m.fillStyle='#4c5041';m.fillRect(0,20,WORLD_W*sx,WORLD_H*sy);
    m.fillStyle='#484239';m.fillRect(0,20,900*sx,(WORLD_H-20)*sy);
    m.fillStyle='#506640';m.fillRect(2750*sx,20,750*sx,(WORLD_H-20)*sy);
    m.fillStyle='#45685f';m.fillRect(3500*sx,20,700*sx,(WORLD_H-20)*sy);
    m.beginPath();m.moveTo(3475*sx,250*sy);m.lineTo(3425*sx,520*sy);m.lineTo(3445*sx,770*sy);m.lineTo(3380*sx,1050*sy);m.lineTo(3410*sx,1370*sy);m.lineTo(3330*sx,1690*sy);m.lineTo(3360*sx,1980*sy);m.lineTo(3260*sx,2280*sy);m.lineTo(3300*sx,2650*sy);m.strokeStyle='#318f89';m.lineWidth=5;m.stroke();
    m.fillStyle='#14201c';m.fillRect(3,3,34,12);m.fillStyle='#f1e4bf';m.font='bold 8px monospace';m.fillText('MAP',8,12);
    m.font='7px monospace';m.fillStyle='#d8ccb0';m.fillText('\u907a\u8de1',25,29);m.fillText('\u6751',75,36);m.fillStyle='#c9d991';m.fillText('\u68ee',151,34);m.fillStyle='#9bd3c3';m.fillText('\u6e7f\u5730',191,37);
    m.beginPath();m.moveTo(635*sx,320*sy);m.lineTo(700*sx,395*sy);m.lineTo(835*sx,470*sy);m.lineTo(970*sx,525*sy);m.lineTo(1190*sx,600*sy);m.lineTo(1500*sx,600*sy);m.lineTo(2050*sx,600*sy);m.lineTo(2420*sx,650*sy);m.lineTo(2800*sx,630*sy);m.lineTo(3100*sx,690*sy);m.lineTo(3300*sx,730*sy);m.lineTo(3500*sx,760*sy);m.lineTo(3800*sx,710*sy);m.lineTo(4200*sx,720*sy);m.strokeStyle='#a88a53';m.lineWidth=5;m.stroke();
    m.fillStyle='#a88958';[[110,420],[420,445],[800,360],[1380,420],[1480,810],[1960,405],[2290,780],[2540,395]].forEach(([x,y])=>m.fillRect(x*sx,y*sy,7,6));
    const target=getQuestTarget();if(target){m.fillStyle='#ffe273';m.beginPath();m.arc(target.x*sx,target.y*sy,4,0,Math.PI*2);m.fill();m.strokeStyle='#ffe273';m.lineWidth=1;m.beginPath();m.arc(target.x*sx,target.y*sy,7,0,Math.PI*2);m.stroke();}
    m.strokeStyle='#d7e9c7';m.lineWidth=1.5;m.strokeRect(camX*sx,camY*sy,W*sx,H*sy);
    m.fillStyle='#fff';m.beginPath();m.arc(player.x*sx,player.y*sy,3,0,Math.PI*2);m.fill();
  }
  let last=0;
  function loop(now){
    const dt=Math.min((now-last)/16.67,2);last=now;
    let dx=joystickState.x,dy=joystickState.y;if(held.has('up'))dy--;if(held.has('down'))dy++;if(held.has('left'))dx--;if(held.has('right'))dx++;
    player.moving=Boolean(dx||dy);
    if(player.moving){
      const mag=Math.hypot(dx,dy);dx/=mag;dy/=mag;
      const nx=player.x+dx*3.2*dt,ny=player.y+dy*3.2*dt;
      const isBlocked=(x,y)=>trees.some(t=>Math.hypot(x-t.x,y-t.y)<42)||forestTrees.some(t=>Math.hypot(x-t.x,y-t.y)<31*t.size) || (Math.abs(x-village.x)<66&&y>village.y-83&&y<village.y+36);
      if(!isBlocked(nx,player.y)) player.x=Math.max(35,Math.min(WORLD_W-35,nx));
      if(!isBlocked(player.x,ny)) player.y=Math.max(250,Math.min(WORLD_H-30,ny));
      player.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
      player.step+=.2*dt;
    }else player.step+=.035*dt;
    if(!encounterOverlay.classList.contains('visible')){
      const place=player.x<900?'古代遺跡':player.x<1800?'灰に沈む村':player.x<3500?'灰冠の森':'沈み川の辺境';
      const placeLabel=worldFrame.querySelector('.world-location');if(placeLabel.dataset.place!==place){placeLabel.dataset.place=place;placeLabel.textContent=place;}
      const close=(obj,r=98)=>Math.hypot(player.x-obj.x,player.y-obj.y)<r;
      const target=close(traveler)?'\u30ea\u30ea\u30a2\u3068\u8a71\u3059':close(summoner,120)?'\u30ac\u30eb\u30c9\u3068\u8a71\u3059':close(witness,115)?'\u751f\u5b58\u8005\u3068\u8a71\u3059':close(elder,115)?'\u8001\u5a46\u3068\u8a71\u3059':close(chapterBoss,130)?'\u9418\u697c\u3078\u9032\u3080':close(bellGuard,125)?'\u9418\u697c\u306e\u5b88\u308a\u3092\u5012\u3059':Date.now()>=encounterCooldownUntil&&close(roadGuard,120)?'\u756a\u5175\u306b\u6311\u3080':close(slime)?'\u9b54\u7269\u306b\u6311\u3080':clueSites.some(o=>!o.found&&close(o,90))?'\u624b\u304c\u304b\u308a\u3092\u8abf\u3079\u308b':close(chest,105)?'\u53e4\u6587\u66f8\u3092\u8abf\u3079\u308b':'';
      fieldAction.textContent=target||'\u8abf\u3079\u308b';
      if(Date.now()>=encounterCooldownUntil&&chapterStage===2&&close(slime)){chapterStage=2.5;beginBattle('gate')}
      else if(chapterStage===3&&!summonMet&&close(summoner,120))interact();
      else if(Date.now()>=encounterCooldownUntil&&chapterStage===5&&close(roadGuard,120)){chapterStage=5.5;beginBattle('road')}
      else if(chapterStage===8.5&&close(chapterBoss,130)){chapterStage=9.5;playDialogue(chapterDialogues.bossIntro,()=>beginBattle('chapterBoss'))}
    }else fieldAction.textContent='';
    draw();requestAnimationFrame(loop);
  }
  draw();
  requestAnimationFrame(loop);
})();
