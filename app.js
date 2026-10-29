import {VERSION, UI_BUILD, HARD_HINTS, CARDS, CARD_LIST, STAGES, ELEMENTS, RARITY_NAMES, DUST_COST, DECK_SIZE, COPY_LIMIT, TRAITS, STORY, TRIO_STAGE, TRIALS, makeBoard, STAGE_PACKS, ACHIEVEMENTS, UPDATES, trialReward} from './data.js?v=0.2.0';
import {stageById, trioOpen, trialOpen, newSave, loadSave, startMatch, roll, playSpell, legalSpell, placementOptions, place, upgrade, declareStrike, answerStrike, pass, aiTurn, goldScore, getLandedTile, validateDeck, editDeck, craft, selectTicket, endMatch, surrender, traitNumbers, claimAchievement, combatPreview, tollOf, neighborBonus, tileBonus, storeDeck, restoreDeck, territoryHealth, migrateCombat} from './game.js?v=0.2.0';
import {unlockAudio, sfx, toggleMute, muted} from './audio.js?v=20261025-audio';
const KEY='rune-territories.save.v1';
const root=document.querySelector('#app');
let save, recoveryRaw=null, storageAvailable=true, initialRaw=null, droppedMatch=false;
try{initialRaw=localStorage.getItem(KEY);}catch(e){storageAvailable=false;console.warn('Local storage unavailable:',e);}
function matchLooksPlayable(m){
  const stage=stageById(m?.stageId);
  const np=isTrio(m)?stageById(m.stageId).players:2;
  const expect=stage?makeBoard(stage.board.w,stage.board.h).ring.length:0;
  if(!m||m.ended||!Array.isArray(m.players)||m.players.length!==np||!Array.isArray(m.tiles)||m.tiles.length!==expect) return false;
  if(!['normal','hard'].includes(m.difficulty)||!['prep','land','strike'].includes(m.phase)) return false;
  const known=ids=>Array.isArray(ids)&&ids.every(id=>!!CARDS[id]);
  if(!(Number.isInteger(m.current)&&m.current>=0&&m.current<np)||!Number.isSafeInteger(m.round)||m.round<1||!Number.isSafeInteger(m.turns)||m.turns<0) return false;
  for(const p of m.players){
    if(!p||!Number.isFinite(p.gold)||p.gold<0||!Number.isInteger(p.pos)||p.pos<0||p.pos>=expect||!known(p.hand)||!known(p.deck)||!known(p.discard)) return false;
  }
  if(m.phase==='strike'&&(!m.strike||m.current===0||!m.players[m.current].hand.includes(m.strike.unitId)||CARDS[m.strike.unitId]?.kind!=='unit'))return false;
  return m.tiles.every((t,i)=>t&&t.index===i&&(t.owner===null||(Number.isInteger(t.owner)&&t.owner>=0&&t.owner<np&&CARDS[t.cardId]?.kind==='unit'&&[1,2,3].includes(t.level))));
}
function keepReward(r){
  if(!r||typeof r!=='object') return null;
  const hotpack=Array.isArray(r.hotpack)?r.hotpack.filter(x=>x&&CARDS[x.id]):[];
  const pulled=Array.isArray(r.pulled)?r.pulled.filter(x=>x&&CARDS[x.id]):[];
  if(r.loss) return {...r,stageId:r.stageId,loss:true,dust:Number(r.dust)||0,pulled};
  const key=r.key&&CARDS[r.key.id]?r.key:null;
  return {...r,key,pulled,hotpack};
}
function loadForLocal(s){const m=s.match,reward=keepReward(s.lastReward);const v=loadSave(s);if(reward)v.lastReward=reward;if(matchLooksPlayable(m))v.match=migrateCombat(m);else if(m)droppedMatch=true;return v;}
try{save=initialRaw?loadForLocal(JSON.parse(initialRaw)):newSave();}catch(e){console.warn('Save read error, original retained:',e);recoveryRaw=initialRaw;save=newSave();}
let page=save.match?'game':'home',difficulty='normal',stageSelected=1,previewStage=1,selectedUnit=null,selectedItem=null,sheet=null,story=null,status=!storageAvailable?'로컬 저장소를 사용할 수 없어 자동 저장이 비활성화되었습니다. JSON 백업을 이용하세요.':droppedMatch?'저장된 대전은 이어갈 수 없어 캠페인 기록만 복구했습니다.':'';
if(!save.match&&save.story&&!save.story.prologue){story={id:'prologue',part:'prologue',page:0,then:null};page='title';}
let preserveScroll=false;
let previewDifficulty='normal';
let collectionElement='all',collectionKind='all',collectionScope='owned',collectionSort='cost',mapTile=null;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&'+'amp;','<':'&'+'lt;','>':'&'+'gt;','"':'&'+'quot;',"'":'&'+'#39;'}[c]));}
let lastPersisted=initialRaw;
let storageConflict=false;
function detectStorageConflict(){
  if(storageConflict)return true;
  if(!storageAvailable)return false;
  try{if(localStorage.getItem(KEY)!==lastPersisted){storageConflict=true;clearFxTimer();if(aiTimer){clearTimeout(aiTimer);aiTimer=null;}fx=null;}}
  catch(e){storageAvailable=false;status='자동 저장 실패: 브라우저 용량/권한 확인';}
  return storageConflict;
}
function persist(){if(recoveryRaw!==null||!storageAvailable||detectStorageConflict())return;try{const raw=JSON.stringify(save);if(raw===lastPersisted)return;localStorage.setItem(KEY,raw);lastPersisted=raw;}catch(e){status='자동 저장 실패: 브라우저 용량/권한 확인';}}
window.addEventListener('storage',e=>{if((e.key===KEY||e.key===null)&&detectStorageConflict()){preserveScroll=true;render();}});
let pendingBuild=window.runePendingBuild||null;
window.addEventListener('rune-update',e=>{pendingBuild=e.detail;preserveScroll=true;render();});
function updateNotice(){return pendingBuild?`<div class="update-notice" role="status"><span>새 버전이 준비됐습니다. 원할 때 적용하세요.</span>${btn('저장 후 업데이트','apply-update','','outline small-button')}</div>`:'';}
function btn(label,act,extra='',cls=''){return `<button class="${cls}" data-action="${act}" ${extra}>${esc(label)}</button>`;}
function badge(s){return `<span class="tag r-${s.toLowerCase()}" title="${RARITY_NAMES[s]}">${s}<span class="rarity-name"> · ${RARITY_NAMES[s]}</span></span>`;}
function cardClass(c){return `type-${c.kind} rarity-${c.rarity.toLowerCase()}`;}
function typeLabel(c){return c.kind==='unit'?ELEMENTS[c.element]:c.kind==='spell'?'주문':'장비';}
function kind(c){return c.kind==='unit'?'유닛':c.kind==='spell'?'주문':'아이템';}
function withTrait(c){const t=c.trait&&TRAITS[c.trait];return t?`${c.desc} 특성 ${t.name}: ${t.text}`:c.desc;}
const STAGE_FACE={1:'leo',2:'mira',3:'ar',4:'noel',5:'lin',6:'ser'};
function isTrio(m){return !!m&&!!stageById(m.stageId)?.trial;}
function sideFace(m,id){return id===0?'player':isTrio(m)?stageById(m.stageId).faces[id-1]||'leo':STAGE_FACE[m.stageId]||'leo';}
function sideName(m,id){return id===0?'나':isTrio(m)?stageById(m.stageId).names[id-1]:'적';}
let trioFF=false,trioFeed=[];
// Sprites (art/sprites, generated originals). Rows of pawns.png follow PAWN_ROWS. @2x on dense screens.
const PAWN_ROWS=['player','leo','mira','ar','noel','lin','ser','hael','on','ian'];
const SP_SUF=(window.devicePixelRatio||1)>1.5?'@2x':'';
const FX_KINDS=[['attack',6],['hit',6],['guard',6],['break',8],['capture',8],['levelup',8],['gold',6],['spell',6]];
(function spriteCSS(){
  const de=document.documentElement.style;
  for(const n of ['pawns','dice','fx','elements']) de.setProperty('--sp-'+n,`url("${new URL(`./art/sprites/${n}${SP_SUF}.png`,document.baseURI).href}")`);
  let css='',start=0;
  for(const [k,n] of FX_KINDS){
    let kf='';for(let i=0;i<n;i++){const f=start+i,c=f%8,r=Math.floor(f/8);kf+=`${(i/n*100).toFixed(2)}%{background-position:${(c/7*100).toFixed(3)}% ${(r/6*100).toFixed(3)}%}`;}
    kf+=`100%{background-position:${((start+n-1)%8/7*100).toFixed(3)}% ${(Math.floor((start+n-1)/8)/6*100).toFixed(3)}%;opacity:0}`;
    css+=`@keyframes fx-${k}{${kf}}.sp-fx.fx-${k}{animation:fx-${k} ${(n/12).toFixed(2)}s steps(1,end) forwards}`;start+=n;
  }
  const el=document.createElement('style');el.textContent=css;document.head.appendChild(el);
})();
function pawnSprite(face,cls,label){const row=Math.max(0,PAWN_ROWS.indexOf(face));return `<span class="pawn sp-pawn ${cls}" role="img" aria-label="${esc(label)}" style="--row:${(row/9*100).toFixed(3)}%"></span>`;}
function fxSprite(kind){return kind?`<span class="sp-fx fx-${kind}" aria-hidden="true"></span>`:'';}
function elementIcon(el){const i=['fire','water','earth','air','neutral','event'].indexOf(el);return i<0?'':`<span class="sp-el" aria-hidden="true" style="background-position:${(i/5*100).toFixed(2)}% 0"></span>`;}
function cornerAt(m,index){return m?.corners?.find(c=>c.index===index)||null;}
function cardSrc(id){return `./art/cards/${id}.png`;}
function faceSrc(name){return `./art/chars/${name}.png`;}
function artTag(src, alt, cls){return `<img loading="lazy" decoding="async" class="${cls}" src="${src}" alt="${esc(alt)}" draggable="false">`;}
function cardMini(id,controls='',attrs='',chosen=false){const c=CARDS[id];const land=shownLand();const fit=c.kind==='unit'&&land&&!cornerAt(save.match,land.index)&&c.element===land.element&&c.element!=='neutral';
 return `<div class="mini-card el-${c.element} ${cardClass(c)}${fit?' fit':''}${chosen?' chosen':''}" ${attrs}>${artTag(cardSrc(id),c.name,'card-art')}<div class="card-title"><span class="el-chip ${c.kind==='unit'?c.element:c.kind}">${typeLabel(c)}</span>${badge(c.rarity)} <b>${esc(c.name)}</b></div><div class="small">${kind(c)} · ${c.cost}G${c.kind==='unit'?` · 공격 ${c.atk} / 생명 ${c.hp}`:''}${fit?' · <b class="fit-label">이 땅에 맞음</b>':''}</div><div class="card-desc">${esc(withTrait(c))}</div>${controls}</div>`;
}
function shownLand(){const m=save.match;if(!m||m.ended||fx)return null;if(m.phase==='strike')return m.tiles[m.players[m.current].pos];if(m.phase==='land'&&m.current===0)return m.tiles[m.players[0].pos];return null;}
function sideCard(id,who,support,hidden){const c=id&&CARDS[id];const sup=hidden?'<div class="back-card">장비 ?</div>':`<p class="small">지원 ${esc(support?CARDS[support].name:'없음')}</p>`;
 if(!c) return `<div class="side unknown"><b>${who}</b><p>유닛을 고르세요</p>${sup}</div>`;
 return `<div class="side el-${c.element} ${cardClass(c)} who-${who==='나'?'me':'foe'}"><div class="who">${who}</div>${artTag(cardSrc(c.id),c.name,'card-art')}<span class="el-chip ${c.kind==='unit'?c.element:c.kind}">${typeLabel(c)}</span><b>${esc(c.name)}</b><p class="small">공격 ${c.atk} · 생명 ${c.hp} · 기본</p>${sup}</div>`;
}
function battleSheet(m){const b=m.battleResult;if(!b)return '';
 const atkWho=sideName(m,b.attacker), defWho=sideName(m,b.defender);
 const d=verdict(b,b.defender===0);
 const flow=`<p class="gold-note">${b.success?'점령 · 통행료 없음':`${atkWho} → ${defWho} 통행료 ${b.paid}G`} · 비용 ${b.cost??(CARDS[b.unitId].cost+(b.atkSupport?CARDS[b.atkSupport].cost:0))}G${b.defSupport?` + 수비 지원 ${CARDS[b.defSupport].cost}G`:''}. 장비·주문은 사용 후 버림패.</p>`;
 const spells=(b.spells||[]).map(x=>`<p class="spell-line">${sideName(m,x.who)} ${esc(x.name)} · ${esc(x.line)}</p>`).join('');
 return `<div class="sheet-back"><article class="sheet battle-sheet ${d.tone==='win'?'win flash-win':'lose flash-lose'}" data-action="noop"><p class="kicker">전투 결과</p><h1>${d.title}</h1><div class="versus">${sideCard(b.unitId,atkWho,b.atkSupport,false)}${sideCard(b.defenderId,defWho,b.defSupport,false)}</div><p class="clash">${d.line}</p><details class="battle-calculations"><summary>계산 자세히</summary>${bonusBlock(b,b.defender===0)}<p class="small">카드 그림의 공격·생명은 기본값입니다.</p></details>${spells}${flow}<div class="go">${btn('확인','battle-clear','','primary')}</div></article></div>`;
}
function nav(){return `<header class="topbar"><div><b>✦ 룬 영토</b><span class="sub"> Alpha ${VERSION} · UI ${UI_BUILD}</span> ${btn(muted()?'소리 끔':'소리 켬','mute','','quiet')}</div><div class="nav">${btn('캠페인','home','','navbtn')}${btn('덱·도감','collection','','navbtn')}${btn('로그','logs','','navbtn')}${btn('백업','backup','','navbtn')}</div></header>`;}
function home(){const p=save.progress;return `<section class="intro home-hero"><img class="home-keyart" src="art/keyart.webp" alt="룬 영토 키아트" width="780" height="439" decoding="async"><div class="home-copy"><h1>영토와 카드의 전술</h1><p>룬 고리를 돌며 <b>영토 선점·자원 투자·침략</b>을 고르는 1:1 AI 캠페인입니다.</p><div class="pills"><span>🪙 재료 ${save.dust}</span><span>🎟️ 선택권 ${save.tickets}</span><span>🃏 덱 ${save.deck.length}/${DECK_SIZE}</span></div><div class="action-row">${btn('프롤로그','story-open','data-stage="0"','outline')}</div></div></section>${save.match?`<div class="notice">진행 중인 대전이 있습니다. ${btn('대전 계속','continue')}</div>`:''}
${rewardHTML()}<section class="section"><h2>캠페인</h2><div class="stage-grid">${STAGES.map(st=>{const lock=st.id>p.highestUnlocked,won=p.wins[st.id]||0;const quote=lock?'':`<p class="story-quote">${esc(STORY.stages[st.id].intro.hook)}</p>`;const face=STAGE_FACE[st.id]||'leo';return `<article class="stage${lock?' lock':''}"><div class="stage-banner">${artTag(faceSrc(face),st.enemy,'stage-face')}<div class="stage-head"><b>${st.id}. ${esc(st.name)}</b><span>${lock?'🔒':p.cleared.includes(st.id)?'✓ 클리어':'도전 가능'}</span></div></div><p>${esc(st.focus)} · 상대: ${esc(st.enemy)}</p>${quote}${st.id===2&&!lock?'<p class="small">미라 대응: 방패로 반격을 버티며 피해를 남기고, 손상된 영토를 마무리하세요. 상대의 출발점 통과 회복에 주의.</p>':''}<details class="stage-more"><summary class="small">보상·규칙</summary><p class="small">승리 ${won}회 · 목표 ${st.target}점 · 8턴부터 선도달 · ${st.maxRounds}턴 종료 · 일반 보상 팩 ${STAGE_PACKS[st.id]}장 · 선택권은 3승, 다음 5승, 다음 7승, 이후 10승마다 1장. 50승·100승은 2장 · 일일 첫 승리 보상 ×2</p></details><div class="stage-buttons">${btn('이야기','story-open',`data-stage="${st.id}" ${lock?'disabled':''}`,'outline')}${btn('카드 확인','deckcheck',`data-stage="${st.id}" ${lock?'disabled':''}`,'outline')}${btn('일반 대전','start',`data-stage="${st.id}" data-diff="normal" ${lock||!!save.match?'disabled':''}`)}${btn('어려움','start',`data-stage="${st.id}" data-diff="hard" ${lock||!p.cleared.includes(st.id)||!!save.match?'disabled':''}`,'outline')}</div></article>`;}).join('')}</div></section>${trioHTML()}${chapterHTML()}${updateHTML()}${achievementHTML()}<section class="section"><h2>알파 0.1 범위</h2><p class="small">현재는 <b>스테이지 ${STAGES.length}개 · 카드 ${CARD_LIST.length}종 · 덱 ${DECK_SIZE}장</b>입니다. 1장은 작은 사각형이고, 뒤 스테이지는 더 크며 가로·세로 모양이 달라집니다.</p></section>`;}
function updateHTML(){return `<section class="section"><h2>업데이트</h2><div class="stage-grid">${UPDATES.map(u=>`<article class="stage"><div class="stage-head"><b>${esc(u.title)}</b><span>${esc(u.date)}</span></div><p class="small">${esc(u.text)}</p></article>`).join('')}</div></section>`;}
function achievementHTML(){const book=save.achievements||{};const losses=save.losses||0;return `<section class="section"><h2>업적</h2><p class="small">누적 패배 ${losses}회. 항복은 세지 않습니다.</p><div class="stage-grid">${ACHIEVEMENTS.map(a=>{const v=book[a.id];const claimed=v==='claimed'||v===true;const ready=v==='ready';return `<article class="stage"><div class="stage-head"><b>${esc(a.name)}</b><span>${claimed?'받음':ready?'보상 대기':'미달성'}</span></div><p class="small">${esc(a.text)}</p>${ready?`<div class="stage-buttons">${btn('보상 받기','claim',`data-id="${a.id}"`,'primary')}</div>`:''}</article>`;}).join('')}</div></section>`;}
function rewardCards(){const r=save.lastReward;return r?[(r.key||null),...(r.hotpack?.length?r.hotpack:r.pulled||[])].filter(v=>v&&CARDS[v.id]):[];}
function rewardHTML(){const r=save.lastReward;if(!r)return '';const cards=rewardCards();const opened=Math.min(cards.length,Number(r.revealed)||0);
 return `<section class="section rewards"><h2>${r.trial?esc(r.trial)+' · ':''}${r.loss?'패배에도 남는 보상':r.achievement?'업적 보상':'승리 보상'}</h2><p>${r.packs?`카드팩 ${r.packs}개 · `:''}카드 ${cards.length}장${r.daily?' · 오늘 첫 승리 ×2':''}${r.ticket?` · 선택권 +${r.ticket}`:''}${r.loss?` · 재료 +${r.dust}`:''}${r.dustGain?` · 재료 +${r.dustGain}`:''}</p>${cards.length?`${btn(r.openedAll?'획득 카드 다시 보기':`카드 개봉 · ${opened}/${cards.length}`,'reward-open','','primary')}<p class="small">카드를 터치해 한 장씩 공개하세요. 획득 내역은 이미 저장되어 있습니다.</p>`:''}</section>`;
}
function revealHTML(){const r=save.lastReward,cards=rewardCards();if(!r||!cards.length)return home();
 const index=Math.max(0,Math.min(cards.length-1,Number(r.revealIndex)||0));
 const opened=Math.max(0,Math.min(cards.length,Number(r.revealed)||0));
 const v=cards[index],c=CARDS[v.id],shown=index<opened,last=index===cards.length-1;
 const fresh=shown&&index===opened-1&&!r.openedAll;
 return `<section class="section pack-opening"><p class="kicker">${r.achievement?'업적 · '+esc(ACHIEVEMENTS.find(a=>a.id===r.achievement)?.name||'보상'):r.loss?'스테이지 '+r.stageId+' · 패배 보상':'스테이지 '+r.stageId+' · 승리팩'} · ${index+1} / ${cards.length}</p><h1>${shown?RARITY_NAMES[c.rarity]+' 공개':'어떤 카드가 기다릴까?'}</h1><div class="reveal-stage rarity-${shown?c.rarity.toLowerCase():'hidden'}"><button class="reveal-card ${shown?`el-${c.element} ${cardClass(c)}`:''} ${shown?'revealed':''} ${fresh?'just-revealed':''}" data-action="${shown?'noop':'reward-reveal'}" aria-label="${shown?esc(c.name):'카드를 터치해서 공개'}">${shown?`${artTag(cardSrc(c.id),c.name,'reveal-art')}${badge(c.rarity)}<h2>${esc(c.name)}</h2><p>${typeLabel(c)} · ${kind(c)} · ${c.cost}G</p><p>${c.kind==='unit'?`공격 ${c.atk} · 생명 ${c.hp}`:esc(c.desc)}</p><p class="reveal-gain">${r.key&&index===0?'최초 클리어 확정 카드 · ':''}${v.converted?'보유 4장 초과 → 제작 재료':'컬렉션에 추가'}</p>`:'<span class="card-sigil">✦</span><b>RUNE TERRITORIES</b><span>터치해서 공개</span>'}</button></div>${shown?`<p class="reveal-description">${esc(withTrait(c))}</p>`:'<p class="reveal-description">한 장씩, 새로운 선택을 만나세요.</p>'}<div class="go">${btn(index?'이전':'캠페인',index?'reward-prev':'home','','outline')}${shown?btn(last?'개봉 완료':'다음 카드',last?'reward-done':'reward-next','','primary'):btn('이 카드 공개','reward-reveal','','primary')}</div><div class="action-row">${btn('모두 공개','reward-all','','quiet')}${btn('캠페인으로','home','','quiet')}</div><p class="small">공개 ${opened} / ${cards.length} · 새로고침 후에도 이어서 개봉할 수 있습니다.</p></section>`;
}
function invadeScore(id){
  const t=getLandedTile(save);
  try{
    const v=combatPreview(save,id);
    const match=CARDS[id].element===t.element&&CARDS[id].element!=='neutral'?40:0;
    return (v.success?1000:0)+match+v.attack;
  }catch{return -999;}
}
function unitPool(kind){
  const m=save.match;if(!m)return [];
  if(kind==='place'){const ids=[...new Set(placementOptions(save))];const t=getLandedTile(save);return ids.sort((a,b)=>((CARDS[a].element===t.element&&CARDS[a].element!=='neutral')?0:1)-((CARDS[b].element===t.element&&CARDS[b].element!=='neutral')?0:1));}
  return [...new Set(m.players[0].hand.filter(id=>CARDS[id].kind==='unit'))].sort((a,b)=>invadeScore(b)-invadeScore(a));
}
function ensureSelected(pool){if(!pool.length){selectedUnit=null;return;}if(!pool.includes(selectedUnit))selectedUnit=pool[0];}
function handAttrs(id){
  const m=save.match,c=CARDS[id];
  if(m&&!m.ended&&!fx){
    if(m.phase==='strike'&&(c.kind==='item'||(c.kind==='spell'&&!m.players[0].spellUsed))) return ['select-item','support',id===selectedItem];
    if(m.current===0&&m.phase==='prep'&&c.kind==='spell'&&legalSpell(save,id)) return ['inspect','spell',false];
    if(m.current===0&&m.phase==='land'){
      const t=getLandedTile(save);
      if(t.owner===null&&c.kind==='unit'&&placementOptions(save).includes(id)) return ['select-unit','place',id===selectedUnit];
      if(t.owner!==null&&t.owner!==0&&c.kind==='unit') return ['select-unit','invade',id===selectedUnit];
      if(t.owner!==null&&t.owner!==0&&(c.kind==='item'||c.kind==='spell')) return ['select-item','support',id===selectedItem];
    }
  }
  return ['inspect','view',false];
}
function shownPos(m,who){const n=m.tiles.length;if(fx&&fx.who===who) return (fx.from+fx.tick)%n; return m.players[who].pos;}
function diePosition(face){const idx=5+face;return `${(idx%8/7*100).toFixed(3)}% ${Math.floor(idx/8)*100}%`;}
function travelLabel(){return `${fx.who?sideName(save.match,fx.who):'나'} ${fx.rolling?'주사위를 굴리는 중 · 1~4':`주사위 ${fx.steps} · ${fx.steps}칸 이동`}`;}
function dieHTML(){if(!fx) return '';return `<div class="die sp-die ${fx.rolling?'rolling':'landed'}" data-face="${fx.face}" aria-hidden="true" style="--face:${diePosition(fx.face)}"><b class="die-face">${fx.face}</b></div>`;}
let tileMemo=null,tileFresh={};
function trackTiles(m){const now=Date.now();const key=m.stageId+':'+m.tiles.length;if(!tileMemo||tileMemo.key!==key){tileMemo={key,cards:m.tiles.map(t=>t.cardId||null),owners:m.tiles.map(t=>t.owner)};tileFresh={};return;}
 m.tiles.forEach((t,i)=>{const c=t.cardId||null;if(c&&c!==tileMemo.cards[i])tileFresh[i]={k:tileMemo.owners[i]!==null&&tileMemo.owners[i]!==t.owner?'captured':'summoned',at:now};tileMemo.cards[i]=c;tileMemo.owners[i]=t.owner;});}
function freshClass(i){const f=tileFresh[i];return f&&Date.now()-f.at<950?' '+f.k:'';}
function board(m){trackTiles(m);let cells=[];const n=m.tiles.length,acting=fx?.who??m.current;const focus=fx?(fx.from+fx.tick)%n:m.players[m.current].pos;for(let i=0;i<n;i++){const t=m.tiles[i],[r,c]=[t.r,t.c];
  const here=focus===i?' here':'';
  const markers=m.players.map(pl=>{const id=pl.id;if(shownPos(m,id)!==i)return '';const hop=fx&&fx.who===id&&!fx.rolling?' hop':'';return pawnSprite(sideFace(m,id),(id===0?'me':'ai'+(id>=2?' ai'+id:''))+(acting===id?' active':'')+hop,sideName(m,id));}).join('');
  const ev=cornerAt(m,i);
  const unit=t.cardId&&CARDS[t.cardId];
  const matched=unit&&unit.element===t.element&&unit.element!=='neutral';
  const struck=m.battleResult&&m.battleResult.tile===i?' struck':'';
  const who=t.owner===null?'':isTrio(m)?sideName(m,t.owner).slice(0,1):t.owner===0?'나':'적';
  const label=ev?ev.name:(unit?unit.name:ELEMENTS[t.element]);
  const health=unit?territoryHealth(m,t):null;
  const next=m.tiles[(i+1)%n],arrow=next.c>c?'→':next.r>r?'↓':next.c<c?'←':'↑';
  const distance=(i-focus+n)%n;const upcoming=!fx&&m.phase==='prep'&&distance>=1&&distance<=4;
  cells.push(`<div data-action="map-tile" data-id="${i}" role="button" tabindex="0" aria-label="${i}번 ${esc(label)} ${who?who+' 영토':'빈 땅'}" class="tile el-${t.element}${upcoming?' upcoming':''}${ev?' event':''}${matched?' matched':''} owner-${t.owner===null?'none':t.owner}${here}${struck}${freshClass(i)}" style="grid-row:${r+1};grid-column:${c+1}" title="${esc(label)}"><span class="tile-number">${i}</span><span class="tile-direction" aria-hidden="true">${arrow}</span><div class="tile-top"><span class="el-chip ${ev?'event':t.element}">${elementIcon(ev?'event':t.element)}${ev?'이벤트':ELEMENTS[t.element]}</span>${matched?`<span class="match-flag">생명 +${Math.max(1,t.level||1)}</span>`:''}${unit&&!matched&&unit.element!=='neutral'?`<span class="miss-flag">불일치</span>`:''}${who?`<span class="who">${who}</span>`:`<b>${t.level?'★'.repeat(t.level):''}</b>`}</div><div class="tile-unit">${unit&&unit.token?`<img class="unit-token" src="./art/tokens/${unit.id}.png" alt="" draggable="false">`:''}${esc(label)}${who&&t.level?` <i>Lv${t.level}${t.damage?` · HP${health.current}`:``}</i>`:''}</div>${here?`<span class="here-flag">${acting?(isTrio(m)?sideName(m,acting)+' 위치':'적 위치'):'내 위치'}</span>`:''}<div class="tile-pawns">${markers}</div></div>`);}
 return `<div class="board${isTrio(m)?' trio-board p'+m.players.length:''}" style="grid-template-columns:repeat(${m.w},minmax(0,1fr));grid-template-rows:repeat(${m.h},minmax(0,1fr))" role="group" aria-label="${n}칸 시계 방향 영토 보드">${cells.join('')}<div class="board-center" style="grid-column:2/${m.w};grid-row:2/${m.h};--bc:url(art/board-center.webp)">${artTag(faceSrc(sideFace(m,acting)), acting?sideName(m,acting):'나','center-face')}<div class="route-hint">↻ 시계 방향으로 이동</div><div>라운드 <b>${m.round}/${stageById(m.stageId).maxRounds}</b></div>${isTrio(m)?m.players.map(pl=>`<div class="score-${pl.id===0?'me':pl.id===1?'ai':'ai'+pl.id} trio-score">${sideName(m,pl.id)} ${goldScore(m,pl.id)}점</div>`).join(''):`<div class="score-me">나 ${goldScore(m,0)}점</div><div class="score-ai">AI ${goldScore(m,1)}점</div>`}<div class="small">목표 ${stageById(m.stageId).target+(m.difficulty==='hard'?180:0)}점</div></div>${dieHTML()}</div><details class="legend-box" data-k="legend"${openK('legend')}><summary>범례·도움말</summary><div class="map-legend${isTrio(m)&&m.players.length>3?' legend-p4':''}">${isTrio(m)?m.players.map(pl=>`<span class="legend-${pl.id===0?'me':pl.id===1?'foe':'ai'+pl.id}">■ ${sideName(m,pl.id)}</span>`).join(''):'<span class="legend-me">■ 내 땅</span><span class="legend-foe">■ 적 땅</span>'}<span>↻ 시계 방향</span><span>점선: 다음 1~4칸</span><span>칸을 눌러 상세</span></div></details>`;
}
function supportChoices(extra=0){
  const p=save.match.players[0], ids=[];
  for(const id of p.hand){
    const c=CARDS[id];
    if(c.kind!=='item'&&c.kind!=='spell') continue;
    if(c.kind==='spell'&&p.spellUsed) continue;
    if(p.gold<c.cost+extra) continue;
    if(!ids.includes(id)) ids.push(id);
  }
  return ids;
}
function supportButtons(ids){
  return [btn('지원 없음','select-item','data-id=""',!selectedItem?'chosen':'') , ...ids.map(id=>btn(CARDS[id].name,'select-item',`data-id="${id}"`,selectedItem===id?'chosen':''))].join('');
}
function verdict(v,defending){
 const outcome=v.outcome||(v.success?'capture':'legacy');
 if(outcome==='legacy')return {title:'이전 버전 전투 기록',line:'이 전투는 개편 전 규칙으로 처리되었습니다.',tone:'lose'};
 const title=outcome==='capture'?'영토 점령 성공':outcome==='attacker-dead'?'공격자 사망 · 수비 유지':'수비 유지 · 손패 복귀';
 const destination=outcome==='capture'?'공격 카드 → 영토':outcome==='attacker-dead'?'공격 카드 → 버림패':'공격 카드 → 손패 (생명 회복)';
 return {title,line:`공격 피해 ${v.attackDamage} · 수비 잔여 ${v.defenderRemaining}HP · 반격 피해 ${v.counterDamage} · 공격자 ${v.attackerRemaining}HP. ${destination}.`,tone:(defending?!v.success:v.success)?'win':'lose'};
}
function bonusLine(label,total,rows){
  if(!rows) return '';
  const bits=rows.filter(r=>r[1]).map(r=>`${r[0]} ${r[1]>0&&r[0]!=='기본'?'+':''}${r[1]}`);
  return `<p class="bonus-line"><b>${label} ${total}</b> ${bits.length?`= ${bits.join(' ')}`:''}</p>`;
}
function bonusBlock(v,defending){
  const p=v.parts; if(!p) return '';
  const atk=defending?'적 공격':'내 공격', land=defending?'내 땅 생명':'적 땅 생명', ret=defending?'내 반격':'적 반격', body=defending?'적 생명':'내 생명';
  return `${bonusLine(atk,v.attack,p.atk)}${bonusLine(land,v.defenderHP,p.hp)}${bonusLine(ret,v.retaliation,p.ret)}${bonusLine(body,v.defense,p.body)}`;
}
function forecastHTML(v,m){
  if(!v) return '<p class="small">유닛을 고르면 상대 장비를 빼고 계산한 예측이 나옵니다.</p>';
  const d=verdict(v,m.phase==='strike');
  return `<p class="forecast ${d.tone}"><b>상대 지원 제외 예상: ${d.title}</b> ${d.line} 통행료 ${v.success?0:v.toll}G (현재 조건). 상대의 숨긴 지원으로 달라질 수 있습니다.</p><details class="why" data-k="why"${openK('why')}><summary>계산 자세히</summary>${bonusBlock(v,m.phase==='strike')}<p class="small">공격이 먼저입니다. 수비 생명이 0이면 반격은 없습니다. 장비 생명은 임시 보호, 남은 피해는 영토에 유지됩니다. 소유자가 출발점을 통과하면 인쇄 생명의 20%(올림) 회복합니다. 상대 지원은 가려져 있습니다.</p></details>`;
}
function openForecast(m){
  try{
    const mine=selectedItem&&CARDS[selectedItem]?.kind==='item'?selectedItem:null;
    if(m.phase==='strike') return combatPreview(save,m.strike.unitId,null,mine);
    if(!selectedUnit) return null;
    return combatPreview(save,selectedUnit,mine,null);
  }catch(e){return null;}
}
function fightControls(m){const p=m.players[0],t=getLandedTile(save);
 const units=unitPool('invade');
 ensureSelected(units);
 const extra=selectedUnit?CARDS[selectedUnit].cost:0;
 const supports=supportChoices(extra);
 if(selectedItem&&!supports.includes(selectedItem))selectedItem=null;
 const pay=extra+(selectedItem?CARDS[selectedItem].cost:0);
 const can=!!(selectedUnit&&p.gold>=pay);
 const winning=units.filter(id=>{try{const v=combatPreview(save,id);return v.success&&CARDS[id].cost<=p.gold;}catch{return false;}});
 const selectedOk=selectedUnit&&winning.includes(selectedUnit);
 const toll=tollOf(m,t);
 const options=units.map(id=>btn(`${winning.includes(id)?'● ':''}${CARDS[id].name}`,'select-unit',`data-id="${id}"`,id===selectedUnit?'chosen':'')).join('');
 const invadeBtn=btn('침략 확정','invade',`${can?'':'disabled'} data-id="${selectedUnit||''}"`,selectedOk?'primary':'outline');
 const leaveBtn=btn(`통행료 ${toll}G 내고 지나감`,'pass','',selectedOk?'outline':'primary');
 const go=`${selectedOk?invadeBtn:leaveBtn}${selectedOk?leaveBtn:invadeBtn}${units.length>1?btn('다음 유닛','next-unit','data-pool="invade"','outline'):''}`;
 const hold=!selectedUnit?'':CARDS[selectedUnit].element===t.element&&CARDS[selectedUnit].element!=='neutral'?`성공하면 이 칸에 남고 이후 생명 +${Math.max(1,t.level||1)}.`:'성공해도 속성이 달라 이후 생명 보너스는 없습니다.';
 const coach=`${hold} 공격·지원 비용은 결과와 무관하게 지불합니다. 수비가 남으면 통행료를 내며, 공격자가 생존하면 카드가 손패로 돌아옵니다. 누적 피해로 다음 침략을 준비할 수 있습니다.`;
 const me=selectedUnit?selectedUnit:null;
 return `<div class="prompt battle-prompt"><div class="versus">${sideCard(t.cardId,'적',null,true)}${sideCard(me,'나',selectedItem,false)}</div>${forecastHTML(openForecast(m),m)}<p class="small">${coach}</p><div class="go">${go}</div><div class="choices unit-choices">${options||'손패에 침략용 유닛이 없습니다.'}</div><div class="choices">${supportButtons(supports)}</div></div>`;
}
function defenseControls(m){
  const supports=supportChoices(0);
  if(selectedItem&&!supports.includes(selectedItem))selectedItem=null;
  const unit=CARDS[m.strike.unitId];
  const tile=m.tiles[m.players[m.current].pos];
  return `<div class="prompt battle-prompt"><div class="versus">${sideCard(unit.id,'적',null,true)}${sideCard(tile.cardId,'나',selectedItem,false)}</div>${forecastHTML(openForecast(m),m)}<div class="go">${btn('수비 확정','answer','','primary')}</div><div class="choices">${supportButtons(supports)}</div></div>`;
}
function turnUI(m){const p=m.players[0];if(fx) return `<div class="prompt"><b>${travelLabel()}</b>${isTrio(m)&&fx.who?ffButton():''}</div>`;if(m.ended)return `<div class="prompt"><div class="go">${btn('캠페인으로','finish','','primary')}</div><div class="prompt-main"><b>${m.winner===0?'승리':'패배'}</b>${isTrio(m)&&save.lastReward?.trial?`<span class="small trial-reward"> ${save.lastReward.loss?`보상: 커먼 ${save.lastReward.pulled.length}장 · 재료 +${save.lastReward.dust}`:`보상: 카드팩 ${save.lastReward.packs}개`}${m.winner===0&&save.achievements?.[stageById(m.stageId).achievement]==='ready'?' · 첫 승리 업적 달성':''}</span>`:''}<p class="small">${esc(m.reason)} · ${m.players.map(pl=>(isTrio(m)?sideName(m,pl.id)+' ':'')+goldScore(m,pl.id)).join(' : ')}</p></div></div>`;
 if(m.phase==='strike') return defenseControls(m);
 if(m.current!==0)return `<div class="prompt">${isTrio(m)?sideName(m,m.current):'AI'}가 판단 중입니다…${isTrio(m)?ffButton():''}</div>`;
 if(m.phase==='prep'){const spells=p.hand.filter(id=>legalSpell(save,id));const pay=m.salaryNotice?`<span class="salary">월급 +${m.salaryNotice}G</span>`:'';return `<div class="prompt"><div class="go">${btn('주사위 굴리기','roll','','primary')}</div><div class="prompt-main"><b>이동 준비</b>${pay}<p class="small">굴리면 고리를 따라 움직입니다. 빈 칸, 내 칸, 적 칸에 따라 할 일이 달라집니다.</p>${spells.length?`<div class="choices">${spells.map(id=>btn(`${CARDS[id].name} 보기`,'inspect',`data-id="${id}" data-intent="spell"`,'outline')).join('')}</div>`:''}</div></div>`;}
 const t=getLandedTile(save);if(cornerAt(m,t.index)){const ev=cornerAt(m,t.index);return `<div class="prompt"><div class="go">${btn('받기','pass','','primary')}</div><div class="prompt-main"><b>${esc(ev.name)}</b><p class="small">${esc(ev.text)}</p></div></div>`;}
 if(t.owner===null){const opts=unitPool('place');ensureSelected(opts);const c=selectedUnit&&CARDS[selectedUnit];
  const fits=opts.filter(id=>CARDS[id].element===t.element&&CARDS[id].element!=='neutral');
  const go=c?`${btn('배치','place',`data-id="${c.id}"`,'primary')}${opts.length>1?btn('다음 유닛','next-unit','data-pool="place"','outline'):''}${btn('안 둠','pass','','outline')}`:btn('안 둠','pass','','primary');
  const coach=fits.length?`이 땅은 ${ELEMENTS[t.element]}입니다. 맞으면 생명 +1. 레벨 2는 +2, 레벨 3은 +3입니다.`:`손패에 맞는 속성이 없습니다. 두면 생명 보너스가 없습니다.`;
  return `<div class="prompt"><div class="go">${go}</div><div class="prompt-main"><b><span class="el-chip ${t.element}">${ELEMENTS[t.element]} 땅</span></b><p class="small">${coach}</p>${c?`<p class="small">선택 <b>${esc(c.name)}</b> · ${c.cost}G · <span class="el-chip ${c.kind==='unit'?c.element:c.kind}">${typeLabel(c)}</span> 공격 ${c.atk} / 생명 ${c.hp}${c.element===t.element&&c.element!=='neutral'?' · 속성 맞음':''}</p>`:'<p class="small">배치할 손패 유닛이 없습니다.</p>'}<div class="choices unit-choices">${opts.map(id=>btn(`${CARDS[id].element===t.element&&CARDS[id].element!=='neutral'?'● ':''}${CARDS[id].name}`,'select-unit',`data-id="${id}"`,id===selectedUnit?'chosen':'')).join('')}</div></div></div>`;}
 if(t.owner===0){const cost=45*t.level;const c=CARDS[t.cardId];const up=t.level<3&&p.gold>=cost;const comfort=p.gold>=cost+50;
  const upBtn=btn(`강화 ${cost}G`,'upgrade',`${up?'':'disabled'}`,comfort?'primary':'outline');
  const skipBtn=btn('넘김','pass','',comfort?'outline':'primary');
  return `<div class="prompt"><div class="go">${comfort?upBtn+skipBtn:skipBtn+upBtn}</div><div class="prompt-main"><b>내 땅 · <span class="el-chip ${c.kind==='unit'?c.element:c.kind}">${typeLabel(c)}</span> ${esc(c.name)} Lv.${t.level}</b><p class="small">카드 생명은 ${c.hp} 그대로입니다. 속성이 맞으면 생명 보너스가 +${t.level}에서 +${Math.min(3,t.level+1)}이 됩니다. 통행료와 점수도 오릅니다.</p></div></div>`;}
 return fightControls(m);
}
function actBanner(){if(!banner)return '';const a=banner;const title={spell:'주문',strike:'공격',blocked:'막힘',retreat:'퇴각'}[a.kind]||'효과';const art=a.id?artTag(cardSrc(a.id),a.name||title,'card-art'):'';const fxk={spell:'spell',strike:'capture',blocked:'guard',retreat:'gold'}[a.kind];return `<div class="act-banner kind-${a.kind} el-${a.element||'neutral'}">${fxSprite(fxk)}${a.kind==='strike'?fxSprite('hit'):''}<p class="kicker">${title}</p>${art}${a.name?`<b>${esc(a.name)}</b>`:''}<p>${esc(a.line||'')}</p></div>`;}
function showBanner(act){if(!act)return;banner=act;if(bannerTimer)clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>{banner=null;bannerTimer=null;preserveScroll=true;render();},1400);}
let banner=null,bannerTimer=null;
const openDetails=new Set();function openK(k){return openDetails.has(k)?' open':'';}
document.addEventListener('toggle',e=>{const k=e.target?.dataset?.k;if(k)openDetails[e.target.open?'add':'delete'](k);},true);
function ffButton(){return btn(trioFF?'▶ 보통 속도':'▶▶ AI 턴 빨리','trio-ff','','outline small-button');}
function goalLine(m){const st=stageById(m.stageId);if(isTrio(m)){const target=st.target;return `<p class="goal trio-goal">${m.round}/${st.maxRounds}턴 · 목표 ${target}점 · 끝나면 최고 자산 승</p><p class="trio-feed">${trioFeed.length?esc(trioFeed[0]):'나와 상관없는 AI끼리의 일은 여기 한 줄로 뜹니다.'}</p>`;}const target=st.target+(m.difficulty==='hard'?180:0);const mine=goldScore(m,0);return `<p class="goal">${m.round}턴 / ${st.maxRounds}턴 · 목표 ${target}점 · 지금 ${mine}점 · 남은 ${Math.max(0,target-mine)}점. 8턴 이후 먼저 도달하면 승리. 끝나면 높은 점수. 점수는 골드 + 땅마다 70 + 카드 가격 + 레벨×85.</p>`;}
function game(){const m=save.match;if(!m)return home();const p=m.players[0];
 if(m.phase==='land'&&m.current===0&&!m.ended){const t=getLandedTile(save);if(t.owner===null)ensureSelected(unitPool('place'));else if(t.owner!==0)ensureSelected(unitPool('invade'));}
 const cards=p.hand.map(id=>{const [act,intent,chosen]=handAttrs(id);return cardMini(id,'',`data-action="${act}" data-id="${id}" data-intent="${intent}"`,chosen);}).join('');
 return `<section class="game-area"><div class="game-header"><b>${esc(stageById(m.stageId).name)}${isTrio(m)?'':` · ${m.difficulty==='hard'?'어려움':'일반'}`}</b><span>나 ${p.gold}G · ${goldScore(m,0)}점</span>${isTrio(m)?m.players.slice(1).map(pl=>`<span>${sideName(m,pl.id)} ${pl.gold}G</span>`).join(''):`<span>상대 ${m.players[1].gold}G · ${goldScore(m,1)}점</span>`}${!m.ended?btn('항복','surrender','','quiet small-button'):''}</div>${goalLine(m)}${m.goldNote?`<p class="gold-note">${esc(m.goldNote)}</p>`:''}${actBanner()}<div class="game-layout"><div class="board-slot">${board(m)}</div><div class="game-side"><div class="dock">${turnUI(m)}</div><div class="hand"><b>손패 ${p.hand.length}</b><div class="hand-row">${cards||'<p>손패 없음</p>'}</div></div><details class="battle-log"><summary>전투 로그</summary><div>${save.log.slice(0,12).map(s=>`<p>${esc(s)}</p>`).join('')}</div></details></div></div></section>${battleSheet(m)}`;}
function hardHintHTML(id){const h=HARD_HINTS[id];return h?`<aside class="hard-hint"><b>어려움 도전 목표</b><p>${esc(h.threat)}</p><p>${esc(h.goal)}</p><p class="small">도움 되는 역할: ${esc(h.tools)}</p><p class="small">특정 카드가 필수인 정답 덱은 아닙니다.</p></aside>`:'';}
function deckCheck(){const st=STAGES.find(x=>x.id===previewStage)||STAGES[0];const hook=STORY.stages[st.id].intro.hook;return `<section class="section"><h1>${previewDifficulty==='hard'?'어려움 · 출전 준비':'대전 전 카드 확인'}</h1><div class="boss-row">${artTag(faceSrc(STAGE_FACE[st.id]),st.enemy,'boss-face')}<div><b>${esc(st.name)}</b><p>상대 ${esc(st.enemy)} · ${esc(st.focus)}</p><p class="story-quote">${esc(hook)}</p><p class="small">내 덱의 그림과 능력을 확인한 다음 대전을 시작하세요.</p></div></div>${previewDifficulty==='hard'?hardHintHTML(st.id):''}${deckSummary()}<div class="action-row">${btn('덱 편집하러 가기','collection','','outline')}</div><div class="collection-grid">${save.deck.map(id=>cardMini(id, btn('크게 보기','inspect',`data-id="${id}" data-intent="view"`,'small-button outline'))).join('')}</div><div class="action-row">${btn(previewDifficulty==='hard'?'이 덱으로 어려움 도전':'이 덱으로 일반 대전','start',`data-stage="${st.id}" data-diff="${previewDifficulty}" data-ready="yes" ${save.match?'disabled':''}`,'primary')}${btn('이야기','story-open',`data-stage="${st.id}"`,'outline')}${btn('캠페인으로','home','','outline')}</div></section>`;}
function storyPack(){
  if(!story) return null;
  if(story.part==='prologue') return STORY.prologue;
  const st=STORY.stages[story.id];
  if(!st) return STORY.prologue;
  if(story.part==='outro') return st.outro;
  if(story.part==='chapter'||story.part==='read'){
    const pages=[...st.intro.pages];
    if(story.part==='chapter'||save.progress.cleared.includes(story.id)) pages.push(...st.outro.pages);
    const title=story.part==='chapter'?st.intro.title:st.intro.title;
    return {kicker:st.intro.kicker, title, face:st.intro.face, pages};
  }
  return st.intro;
}
function markStory(){
  if(!story||!save.story) return;
  if(story.part==='prologue') save.story.prologue=true;
  if(typeof story.id==='number'){
    if(story.part==='intro'||story.part==='read'||story.part==='chapter') save.story.intro[story.id]=true;
    if(story.part==='outro'||story.part==='chapter'||(story.part==='read'&&save.progress.cleared.includes(story.id))) save.story.outro[story.id]=true;
    if(story.part==='chapter') save.story.done[story.id]=true;
  }
}
function chapterOpen(id){
  if(id===4) return save.progress.cleared.includes(3);
  if(id===7) return save.progress.cleared.includes(6);
  return !!(save.story.done&&save.story.done[id-1]);
}
const READ_CHAPTERS=Object.keys(STORY.stages).map(Number).filter(id=>id>STAGES.length).sort((a,b)=>a-b);
function trioHTML(){return TRIALS.map(st=>{const open=trialOpen(save,st),r=save[st.record]||{played:0,wins:0};const rw=trialReward(st.minutes),lock=st.id===TRIO_STAGE.id?'1장 클리어 후':'3인 시범 1판 또는 2장 클리어 후';const faces=`<div class="trio-faces">${artTag(faceSrc('player'),'나','me-face')}${(st.faces||[]).map((f,i)=>artTag(faceSrc(f),st.names[i]||f,'')).join('')}</div>`;return `<section class="section trio"><h2>${esc(st.name)} <span class="small">선택</span></h2>${faces}<p class="small">나 · ${esc(st.names.join(' · '))}가 ${makeBoard(st.board.w,st.board.h).ring.length}칸 고리 하나를 같이 돕니다. ${st.maxRounds}턴, 목표 ${st.target}점, 약 ${Math.round(st.minutes)}분.</p><details class="stage-more"><summary class="small">보상·규칙</summary><p class="small">보상: 승리 카드팩 ${rw.winPacks}개 · 패배 커먼 ${rw.lossCommons}장+재료 ${rw.lossDust} · 첫 승리 업적 재료 +${ACHIEVEMENTS.find(a=>a.id===st.achievement).dust}. 항복은 보상 없음. ${r.played?`기록 ${r.wins}승 / ${r.played}판`:''}</p></details>${btn(open?`${esc(st.name)} 시작`:`🔒 ${lock}`,'start',`data-stage="${st.id}" data-diff="normal" data-ready="yes" ${open&&!save.match?'':'disabled'}`,'outline')}</section>`;}).join('');}
function chapterHTML(){if(!READ_CHAPTERS.length)return '';const any=chapterOpen(READ_CHAPTERS[0]);return `<section class="section chapters"><h2>둘째 권 · 읽는 장</h2><p class="small">${any?'전투 없는 장입니다. 한 장을 다 읽으면 다음 장이 열립니다.':'6장을 클리어하면 7장부터 열립니다.'}</p><div class="chapter-list">${READ_CHAPTERS.map(id=>{const st=STORY.stages[id],open=chapterOpen(id),done=save.story.done&&save.story.done[id];return btn(`${open?'':'🔒 '}${esc(st.intro.kicker)}${done?' ✓':''}`,'story-open',`data-stage="${id}" data-part="chapter" ${open?'':'disabled'}`,'outline');}).join('')}</div></section>`;}
function beginMatch(stageId,diff){startMatch(save,Number(stageId),diff);selectedUnit=null;selectedItem=null;sheet=null;story=null;page='game';sfx('tap');}
function closeStory(finished=true){
  const then=story&&story.then;const wasOutro=story?.part==='outro';
  if(finished) markStory();
  story=null;
  if(then&&then.act==='start'){beginMatch(then.stage, then.diff);return;}
  page=wasOutro&&rewardCards().length?'rewards':'home';
}
// 타이틀·키아트 (GrokBot 2026-10-22): 프롤로그 전 한 번. 저장 필드 없음.
function titleHTML(){return `<section class="section title-art"><img class="keyart" src="art/keyart.webp" alt="룬 영토 키아트: 룬 고리 판 앞의 여행자들" width="780" height="439"><div class="title-copy"><h1>룬 영토</h1><p class="title-tag">고리를 걷고, 땅에 이름을 붙이고, 카드로 지켜라.</p><p class="small">주사위 · 배치 · 침략 · 덱 40장. 1:1 캠페인과 3인·4인 시범.</p>${btn('이야기 시작','title-start','','primary')}</div></section>`;}
function storyHTML(){
  const pack=storyPack(); if(!pack) return '';
  const beat=pack.pages[Math.min(story.page, pack.pages.length-1)];
  const last=story.page>=pack.pages.length-1;
  const face=beat.face||pack.face||'player';
  const nextLabel=last?(story.then&&story.then.act==='start'?'이 이야기로 대전':'캠페인으로'):'다음';
  return `<section class="story-screen"><p class="kicker">${esc(pack.kicker||'이야기')}</p><h1>${esc(pack.title)}</h1><article class="story-card">${artTag(faceSrc(face), beat.speaker||'이야기', 'story-face')}<div><b>${esc(beat.speaker||'')}</b><p class="story-line">${esc(beat.text)}</p></div></article><p class="small story-step">${story.page+1} / ${pack.pages.length}</p><div class="go">${btn(nextLabel,'story-next','','primary')}${last?'':btn('건너뛰기','story-skip','','outline')}</div></section>`;
}
function mapSheetHTML(){const m=save.match,t=m?.tiles[mapTile];if(mapTile===null||!t)return '';const c=t.cardId&&CARDS[t.cardId],ev=cornerAt(m,t.index);const owner=t.owner===0?'내 영토':t.owner===1?'상대 영토':'빈 땅';const hp=c?territoryHealth(m,t).current:0;
 return `<div class="sheet-back" data-action="map-close"><article class="sheet tile-sheet" data-action="noop"><p class="kicker">${t.index}번 칸 · ${ev?'이벤트':ELEMENTS[t.element]} · ${owner}</p><h1>${esc(ev?.name||c?.name||ELEMENTS[t.element]+' 땅')}</h1>${ev?`<p>${esc(ev.text)}</p>`:c?`${artTag(cardSrc(c.id),c.name,'sheet-art')}<p>Lv.${t.level} · 수비 생명 <b>${hp}/${territoryHealth(m,t).max}</b> · 통행료 <b>${tollOf(m,t)}G</b></p><p class="small">누적 피해 ${territoryHealth(m,t).damage} · 출발점 통과 시 최대 ${Math.ceil(c.hp*.2)}HP 회복. 인쇄 생명 ${c.hp} + 지형 ${tileBonus(t,c)} + 연속 ${neighborBonus(m,t,t.owner)} + 특성·이웃 ${traitNumbers(m,t).hp}</p><p>${esc(withTrait(c))}</p>`:'<p>이 칸에 도착하면 손패 유닛을 배치할 수 있습니다. 같은 속성 유닛은 수비 생명 +레벨.</p>'}<p class="small">다음 칸 ${(t.index+1)%m.tiles.length}번 · 시계 방향</p>${btn('보드로 돌아가기','map-close','','primary')}</article></div>`;
}
function sheetHTML(){if(!sheet||!CARDS[sheet.id])return '';const c=CARDS[sheet.id];let play='';
 if(sheet.intent==='place') play=btn('확인하고 배치','place',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='spell') play=btn('확인하고 주문','spell',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='invade') play=btn('이 유닛으로 확정','invade',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='support'||sheet.intent==='item') play=btn('이 지원을 고름','select-item',`data-id="${c.id}"`,'primary');
 return `<div class="sheet-back" data-action="sheet-close"><article class="sheet el-${c.element} ${cardClass(c)}" data-action="noop">${artTag(cardSrc(c.id),c.name,'sheet-art')}<div class="card-title">${badge(c.rarity)} <b>${esc(c.name)}</b></div><p>${typeLabel(c)} · ${kind(c)} · ${c.cost}G${c.kind==='unit'?` · 공격 ${c.atk} / 생명 ${c.hp} · 땅이 맞으면 생명 +레벨`:''}</p><p>${esc(withTrait(c))}</p><div class="action-row">${play}${btn('닫기','sheet-close','','outline')}</div></article></div>`;}
function deckSummary(){
 const elements={fire:0,water:0,earth:0,air:0,neutral:0},types={unit:0,spell:0,item:0};let gold=0;
 for(const id of save.deck){const c=CARDS[id];if(!c)continue;types[c.kind]++;gold+=c.cost;if(c.kind==='unit')elements[c.element]++;}
 const chips=Object.entries(elements).map(([el,n])=>btn(`${ELEMENTS[el]} ${n}`,'filter-element',`data-id="${el}" aria-pressed="${collectionElement===el}"`,'el-chip '+el+(collectionElement===el?' chosen':''))).join('');
 return `<div class="deck-sum"><div class="deck-total"><b>현재 덱 ${save.deck.length} / ${DECK_SIZE}</b><span>${save.deck.length===DECK_SIZE?'✓ 대전 준비 완료':`${DECK_SIZE-save.deck.length}장 더 필요`}</span></div><div class="deck-type-counts">${Object.entries(types).map(([k,n])=>btn(`${k==='unit'?'유닛':k==='spell'?'주문':'장비'} ${n}장`,'filter-kind',`data-id="${k}" aria-pressed="${collectionKind===k}"`,collectionKind===k?'chosen':'outline')).join('')}</div><p class="small">유닛 속성 구성</p><div class="pills">${chips}</div><p class="small">주문·장비는 속성 수에서 제외 · 평균 비용 ${save.deck.length?Math.round(gold/save.deck.length):0}G</p></div>`;
}
function cardLegendHTML(){return `<details class="card-legend"><summary>테두리 읽는 법 · 색 = 종류 / 장식 = 희귀도</summary><div class="frame-key">${[['spell','주문 · 검정'],['item','장비 · 회색'],['fire','화염'],['water','물'],['earth','대지'],['air','바람'],['neutral','무속성 · 흰색']].map(([id,label])=>`<span class="frame-sample ${id==='spell'||id==='item'?'type-'+id:'type-unit el-'+id} rarity-c">${label}</span>`).join('')}</div><div class="frame-key">${[['c','C · 기본'],['u','U · 이중선'],['r','R · 모서리'],['e','E · 문양'],['l','L · 금빛 문장']].map(([id,label])=>`<span class="frame-sample type-unit el-neutral rarity-${id}">${label}</span>`).join('')}</div></details>`;}
function deckSlotsHTML(){return `<details class="deck-slots"><summary>덱 보관함 · 8개 슬롯</summary><p class="small">현재 덱을 이름 붙여 보관하고 교체하세요. 여러 화염 덱처럼 같은 속성도 여러 개 저장할 수 있습니다.</p><div class="slot-grid">${Array.from({length:8},(_,i)=>{const slot=save.deckSlots?.[i];return `<div class="deck-slot"><b>${i+1}. ${esc(slot?.name||'빈 슬롯')}</b><div class="action-row">${btn(slot?'덮어쓰기':'현재 덱 저장','deck-store',`data-id="${i}" ${save.match||save.deck.length!==DECK_SIZE?'disabled':''}`,'outline small-button')}${slot?btn('불러오기','deck-restore',`data-id="${i}" ${save.match?'disabled':''}`,'small-button'):''}</div></div>`;}).join('')}</div></details>`;}
function collection(){const counts={};save.deck.forEach(id=>counts[id]=(counts[id]||0)+1);
 const known=CARD_LIST.filter(c=>save.progress.cleared.includes(c.stage)||(save.collection[c.id]||0)>0);
 const filtered=known.filter(c=>(collectionScope==='all'||(collectionScope==='deck'?counts[c.id]>0:(save.collection[c.id]||0)>0))&&(collectionElement==='all'||c.element===collectionElement)&&(collectionKind==='all'||c.kind===collectionKind));
 filtered.sort((a,b)=>collectionSort==='name'?a.name.localeCompare(b.name,'ko'):collectionSort==='rarity'?['C','U','R','E','L'].indexOf(b.rarity)-['C','U','R','E','L'].indexOf(a.rarity)||a.cost-b.cost:a.cost-b.cost||a.name.localeCompare(b.name,'ko'));
 const filters=`<div class="collection-filters"><div class="filter-row">${[['owned','보유 카드'],['deck','덱에 든 카드'],['all','제작·선택권']].map(([id,label])=>btn(label,'filter-scope',`data-id="${id}"`,collectionScope===id?'chosen':'outline')).join('')}</div><div class="filter-row">${btn('속성 전체','filter-element','data-id="all"',collectionElement==='all'?'chosen':'outline')}${btn('종류 전체','filter-kind','data-id="all"',collectionKind==='all'?'chosen':'outline')}${btn('필터 초기화','filter-reset','','quiet')}</div><label>정렬 <select id="collection-sort"><option value="cost" ${collectionSort==='cost'?'selected':''}>비용 낮은 순</option><option value="rarity" ${collectionSort==='rarity'?'selected':''}>등급 높은 순</option><option value="name" ${collectionSort==='name'?'selected':''}>이름순</option></select></label><span class="small"> ${filtered.length}종 표시</span></div>`;
 return `<section class="section"><h1>카드 컬렉션 · 덱 편집</h1>${previewDifficulty==='hard'?`<div class="action-row">${btn('어려움 출전 준비로','hard-prep','','outline')}</div>`:''}<div class="deck-tools">${deckSummary()}${filters}</div>${deckSlotsHTML()}${cardLegendHTML()}<p>제작 재료 ${save.dust} · 카드 선택권 ${save.tickets}장</p><p class="small">선택권은 클리어한 스테이지의 커먼~레어 카드 중에서 선택. 보관 후 사용 가능. 레전더리도 최대 4장까지 수집 가능.</p>${save.match?'<p class="warning">진행 중인 대전에서는 덱 편집이 잠겨 있습니다.</p>':''}<div class="collection-grid">${filtered.length?'':'<p class="empty-cards">조건에 맞는 카드가 없습니다. 속성·종류 필터를 바꾸세요.</p>'}${filtered.map(c=>{
  const owned=save.collection[c.id]||0,n=counts[c.id]||0,unlocked=save.progress.cleared.includes(c.stage),canCraft=unlocked&&owned<4&&save.dust>=DUST_COST[c.rarity];
  return cardMini(c.id,`<div class="small">보유 ${owned}/4 · 덱 ${n}/4 · 출처: 스테이지 ${c.stage}</div><div class="copy-meter" aria-label="덱에 ${n}장">${Array.from({length:4},(_,i)=>`<i class="${i<n?'filled':''}"></i>`).join('')}</div><div class="action-row mini-actions">${btn('−','deck-minus',`data-id="${c.id}" ${!n||!!save.match?'disabled':''}`,'small-button')}${btn('+','deck-plus',`data-id="${c.id}" ${n>=owned||save.deck.length>=DECK_SIZE||!!save.match?'disabled':''}`,'small-button')}${btn(`제작 ${DUST_COST[c.rarity]}`,'craft',`data-id="${c.id}" ${!canCraft?'disabled':''}`,'small-button outline')}${btn('선택권','ticket',`data-id="${c.id}" ${!unlocked||!['C','U','R'].includes(c.rarity)||!save.tickets||owned>=4?'disabled':''}`,'small-button outline')}</div>`);
 }).join('')}</div><p class="small">승리 카드팩은 그 스테이지 카드만 줍니다. 최초 클리어 핵심 카드는 팩과 따로 나옵니다. 선택권·제작은 클리어한 스테이지 전체에서 고릅니다.</p></section>`;
}
function logs(){return `<section class="section"><h1>게임 로그</h1><p>최신 100개 이벤트만 표시. 개발용 변경 기록은 <code>logs/WORKLOG.md</code>와 <code>HANDOFF.md</code>를 참고.</p><div class="logs">${save.log.map(v=>`<p>${esc(v)}</p>`).join('')}</div></section>`;}
function backup(){return `<section class="section"><h1>백업 · 복원</h1><p>자동 저장은 현재 브라우저 <code>localStorage</code>를 사용하며 클라우드 동기화는 없습니다.</p>${btn('JSON 백업 내려받기','export')}${btn('JSON 가져오기','import','','outline')}<input id="import-file" type="file" accept="application/json,.json" hidden/><p class="small">주의: JSON 가져오기는 수집·클리어·덱을 복구하지만 진행 중이던 경기는 복원하지 않습니다(알파 0.1 규격). 가져오기 전 현재 저장을 반드시 내보내세요.</p><hr/>${btn('처음부터 새로 시작','reset','','danger')}</section>`;}
function render(){
  const y=preserveScroll?window.scrollY:0;
  const hand=document.querySelector('.hand'); const hx=hand?hand.scrollLeft:0;
  const row=document.querySelector('.hand-row'); const rx=row?row.scrollLeft:0;
  const side=document.querySelector('.game-side'); const sy=side?side.scrollTop:0;
  const dock=document.querySelector('.dock'); const dy=dock?dock.scrollTop:0;
  persist();
  if(storageConflict){document.body.classList.remove('ingame');root.innerHTML=`<section class="notice"><h2>다른 탭에서 진행 기록이 바뀌었습니다</h2><p>최신 기록을 덮어쓰지 않도록 이 탭의 진행을 멈췄습니다. 이 탭의 상태를 JSON으로 보관하거나 최신 기록을 불러오세요.</p>${btn('이 탭 상태 보관','conflict-export','','outline')}${btn('최신 기록 불러오기','conflict-reload','','primary')}</section>`;preserveScroll=false;return;}
  document.body.classList.toggle('ingame', page==='game'&&!!save.match&&!save.match.ended);
  if(recoveryRaw!==null){root.innerHTML=nav()+`<section class="notice"><h2>이전 저장 데이터 보호</h2><p>현재 프로그램과 호환되지 않는 저장이 발견되어 기존 데이터를 덮어쓰지 않았습니다. 먼저 원본을 내려받아 보관하세요.</p>${btn('기존 JSON 내려받기','recover-export')}${btn('백업 확인 후 새 게임 시작','recover-reset','','danger')}</section>`;preserveScroll=false;return;}
  root.innerHTML=nav()+updateNotice()+(status?`<div class="status" role="alert">${esc(status)} ${btn('닫기','dismiss','','quiet')}</div>`:'')+(page==='rewards'?revealHTML():page==='home'?home():page==='deckcheck'?deckCheck():page==='game'?game():page==='title'?titleHTML():page==='story'?storyHTML():page==='collection'?collection():page==='logs'?logs():backup())+sheetHTML()+mapSheetHTML()+(page==='game'||page==='story'?'':`<footer>Rune Territories · Original prototype · UI ${UI_BUILD}</footer>`);
  if(preserveScroll){
    const apply=()=>{window.scrollTo(0,y);const h=document.querySelector('.hand');if(h)h.scrollLeft=hx;const row=document.querySelector('.hand-row');if(row)row.scrollLeft=rx;const g=document.querySelector('.game-side');if(g)g.scrollTop=sy;const d=document.querySelector('.dock');if(d)d.scrollTop=dy;};
    apply(); requestAnimationFrame(apply);
  }
  preserveScroll=false;
  cueSalary();
}
function doAction(act,id,el){
  if(act==='conflict-export'){const b=new Blob([JSON.stringify(save,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='rune-territories-tab-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return;}
  if(act==='conflict-reload'){location.reload();return;}
  if(detectStorageConflict()){render();return;}
  if(act==='apply-update'){persist();if(storageConflict){render();return;}if(!storageAvailable||status.startsWith('자동 저장 실패')){render();return;}const u=new URL(location.href);u.searchParams.set('b',pendingBuild);location.replace(u);return;}
  if(['home','collection','logs','backup','finish','start','continue'].includes(act))mapTile=null;
  preserveScroll=!['home','collection','logs','backup','finish','surrender','start','reset','recover-reset','continue','hard-prep','recover-export','story-next','story-skip','story-open'].includes(act);
  switch(act){
 case 'hard-prep':page='deckcheck';sheet=null;break;
 case 'filter-element':collectionElement=id; if(id!=='all')collectionKind='unit';page='collection';break;
 case 'filter-kind':collectionKind=id;if(id==='spell'||id==='item')collectionElement='all';page='collection';break;
 case 'filter-scope':collectionScope=id;break;
 case 'filter-reset':collectionElement='all';collectionKind='all';collectionScope='owned';break;
 case 'deck-store':{const index=Number(id),old=save.deckSlots?.[index];if(old&&!confirm(`「${old.name}」 덱을 덮어쓸까요?`))return;const name=prompt('보관할 덱 이름 (예: 화염 공격 1)',old?.name||`덱 ${index+1}`);if(name===null)return;storeDeck(save,index,name);status='현재 덱을 보관했습니다.';break;}
 case 'deck-restore':restoreDeck(save,Number(id));status='보관한 덱을 불러왔습니다.';break;
 case 'reward-open':if(save.lastReward?.openedAll)save.lastReward.revealIndex=0;page='rewards';sheet=null;break;
 case 'reward-reveal':{const r=save.lastReward;if(r){const index=Math.max(0,Math.min(rewardCards().length-1,Number(r.revealIndex)||0));r.revealIndex=index;r.revealed=Math.max(Number(r.revealed)||0,index+1);sfx(['E','L'].includes(CARDS[rewardCards()[index]?.id]?.rarity)?'win':'summon');}break;}
 case 'reward-next':if(save.lastReward)save.lastReward.revealIndex=Math.min(rewardCards().length-1,(Number(save.lastReward.revealIndex)||0)+1);break;
 case 'reward-prev':if(save.lastReward)save.lastReward.revealIndex=Math.max(0,(Number(save.lastReward.revealIndex)||0)-1);break;
 case 'reward-all':if(save.lastReward){save.lastReward.revealed=rewardCards().length;save.lastReward.openedAll=true;}break;
 case 'reward-done':if(save.lastReward)save.lastReward.openedAll=true;page='home';break;
 case 'map-tile':mapTile=Number(id);break;
 case 'map-close':mapTile=null;break;
 case 'recover-export':{const b=new Blob([recoveryRaw],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='rune-territories-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return;}
 case 'recover-reset':if(confirm('복구 JSON을 내려받아 안전하게 저장했나요? 새 게임을 시작하면 기존 데이터가 바뀝니다.')){recoveryRaw=null;save=newSave();story={id:'prologue',part:'prologue',page:0,then:null};page='story';status='';}break;
 case 'home':page='home';sheet=null;break;
 case 'collection':page='collection';sheet=null;break;
 case 'logs':page='logs';break;
 case 'backup':page='backup';break;
 case 'dismiss':status='';break;
 case 'title-start':page='story';break;
 case 'mute':toggleMute();sfx('tap');break;
 case 'deckcheck':previewDifficulty='normal';previewStage=Number(el.dataset.stage)||1;page='deckcheck';sheet=null;break;
 case 'inspect':sheet={id,intent:el.dataset.intent||'view'};if(sheet.intent==='invade')selectedUnit=id;if(sheet.intent==='item')selectedItem=id;sfx('tap');break;
 case 'sheet-close':sheet=null;break;
 case 'noop':return;
 case 'continue':page='game';break;
 case 'start':{const stageId=Number(el.dataset.stage),diff=el.dataset.diff;if(diff==='hard'&&el.dataset.ready!=='yes'){previewStage=stageId;previewDifficulty='hard';page='deckcheck';sheet=null;break;}if(!stageById(stageId)?.trial&&!save.story.intro[stageId]){story={id:stageId,part:'intro',page:0,then:{act:'start',stage:stageId,diff}};page='story';sheet=null;sfx('tap');break;}beginMatch(stageId,diff);break;}
 case 'story-open':{const n=Number(el.dataset.stage)||0;const part=el.dataset.part==='chapter'?'chapter':(n?'read':'prologue');if(part==='chapter'&&!chapterOpen(n))break;story=n?{id:n,part,page:0,then:null}:{id:'prologue',part:'prologue',page:0,then:null};page='story';sheet=null;sfx('tap');break;}
 case 'story-next':{const pack=storyPack();if(story&&pack&&story.page<pack.pages.length-1){story.page++;sfx('tap');break;}closeStory();sfx('tap');break;}
 case 'story-skip':closeStory(story.part!=='chapter');sfx('tap');break;
 case 'spell':playSpell(save,id);sheet=null;sfx('spell');showBanner(save.match?.act);break;
 case 'roll':{const who=save.match.current,from=save.match.players[who].pos;const steps=roll(save);startTravel(who,from,steps);return;}
 case 'place':place(save,id);sheet=null;sfx('summon');break;
 case 'upgrade':upgrade(save);sfx('upgrade');break;
 case 'pass':pass(save);sfx('tap');showBanner(save.match?.act);break;
 case 'select-unit':selectedUnit=id;sheet=null;sfx('tap');break;
 case 'next-unit':{const pool=unitPool(el.dataset.pool==='invade'?'invade':'place');if(pool.length){const i=pool.indexOf(selectedUnit);selectedUnit=pool[(i+1)%pool.length];}sfx('tap');break;}
 case 'select-item':selectedItem=id||null;sheet=null;sfx('tap');break;
 case 'invade':if(id)selectedUnit=id;if(!selectedUnit)throw new Error('침략 유닛을 선택하세요.');{const ok=declareStrike(save,selectedUnit,selectedItem);sfx(ok?'hit':'fail');showBanner(save.match?.act);}selectedUnit=null;selectedItem=null;sheet=null;break;
 case 'answer':{const ok=answerStrike(save,selectedItem);sfx(ok?'hit':'fail');showBanner(save.match?.act);}selectedItem=null;sheet=null;break;
 case 'trio-ff':trioFF=!trioFF;if(trioFF&&fx&&fx.who&&!fx.involved){clearFxTimer();fx=null;}break;
 case 'battle-clear':if(save.match)save.match.battleResult=null;break;
 case 'finish':{const won=save.match?.winner===0;const stageId=save.match?.stageId;endMatch(save);sheet=null;if(stageById(stageId)?.trial){trioFeed=[];page='home';sfx(won?'win':'lose');break;}if(won&&stageId&&!save.story.outro[stageId]){story={id:stageId,part:'outro',page:0,then:null};page='story';sfx('win');break;}page=rewardCards().length?'rewards':'home';sfx(won?'win':'lose');break;}
 case 'surrender':if(confirm('항복하면 보상을 받지 못합니다. 대전을 종료할까요?')){surrender(save);page='home';}break;
 case 'deck-plus':editDeck(save,id,1);break;
 case 'deck-minus':editDeck(save,id,-1);break;
 case 'craft':craft(save,id);break;
 case 'ticket':selectTicket(save,id);break;
 case 'claim':claimAchievement(save,id);page=rewardCards().length?'rewards':'home';break;
 case 'export':{const blob=new Blob([JSON.stringify({...save,match:null,lastReward:null},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='rune-territories-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status='수집·덱·진행 기록을 JSON으로 내보냈습니다.';break;}
 case 'import':document.getElementById('import-file').click();return;
 case 'reset':if(confirm('모든 진행 데이터를 초기화할까요? (복구 불가)')){save=newSave();story={id:'prologue',part:'prologue',page:0,then:null};page='story';status='';}break;
 }render();queueAi();}
const MUTATING=new Set(['spell','roll','place','upgrade','pass','invade','answer','start','finish','surrender','deck-plus','deck-minus','craft','ticket','claim','reset','recover-reset']);
root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.tile[data-action]')){e.preventDefault();doAction('map-tile',e.target.dataset.id,e.target);}});
let actLock=0, aiTimer=null, audioReady=false, heardSalary=-1, fx=null, fxTimer=null;
function clearFxTimer(){if(fxTimer){clearTimeout(fxTimer);fxTimer=null;}}
function startTravel(who,from,steps,fast=false){
  clearFxTimer();
  if(!(steps>=1&&steps<=4)){fx=null;preserveScroll=true;render();return;}
  fx={who,from,steps,tick:0,face:1,rolling:true,fast,until:Date.now()+(fast?700+steps*180:1600+steps*380)};
  preserveScroll=true;render();sfx('dice');
  let spins=0;
  const spin=()=>{
    if(!fx||!fx.rolling) return;
    spins++;
    fx.face=spins>=(fx.fast?3:7)?steps:1+Math.floor(Math.random()*4);
    const die=document.querySelector('.die'),face=document.querySelector('.die-face'),label=document.querySelector('.prompt b');
    if(face) face.textContent=String(fx.face);
    // The same 1..4 face drives both the sprite and its text, including the final frame.
    if(die){die.dataset.face=String(fx.face);die.style.setProperty('--face',diePosition(fx.face));}
    if(spins>=(fx.fast?3:7)){fx.rolling=false;fx.face=steps;if(die){die.classList.remove('rolling');die.classList.add('landed');}if(label)label.textContent=travelLabel();fxTimer=setTimeout(hop,fx.fast?160:360);return;}
    if(label) label.textContent=travelLabel();
    fxTimer=setTimeout(spin,70);
  };
  fxTimer=setTimeout(spin,70);
}
function hop(){
  try{
    if(!fx) return;
    if(fx.tick>=fx.steps){fx=null;preserveScroll=true;render();queueAi();return;}
    fx.tick++;sfx('step');preserveScroll=true;render();
    fxTimer=setTimeout(hop,fx.fast?140:320);
  }catch(e){clearFxTimer();fx=null;status=e.message;preserveScroll=true;render();}
}
function cueSalary(){const m=save.match;if(fx||!m||m.ended||m.current!==0||!m.salaryNotice)return;if(heardSalary===m.turns)return;heardSalary=m.turns;sfx('salary');}
function queueAi(){
  if(storageConflict||fx||aiTimer||!save.match||save.match.current===0||save.match.ended||save.match.phase==='strike'||save.match.battleResult) return;
  aiTimer=setTimeout(()=>{
    aiTimer=null;
    const m=save.match;
    if(detectStorageConflict()){render();return;}
    if(fx||!m||m.current===0||m.ended) return;
    const cur=m.current,from=m.players[cur].pos,rolled=m.phase==='prep',trio=isTrio(m);
    const g0=m.players[0].gold,own0=m.tiles.map(t=>t.owner===0).join(),prev=save.log.slice(0,3);
    try{aiTurn(save);status='';}catch(e){status=`AI 오류: ${e.message}`;preserveScroll=true;render();return;}
    const now=save.match,steps=rolled?(now.players[cur].pos-from+now.tiles.length)%now.tiles.length:0;
    const b=now.battleResult;
    // 3p: full animation only when my land, my gold or my pawn is involved. Otherwise one summary line.
    const involved=!trio||now.phase==='strike'||(b&&(b.attacker===0||b.defender===0))||now.players[0].gold!==g0||now.tiles.map(t=>t.owner===0).join()!==own0||now.players[cur].pos===now.players[0].pos;
    if(trio){let k=0;while(k<save.log.length&&!(save.log[k]===prev[0]&&save.log[k+1]===prev[1]&&save.log[k+2]===prev[2]))k++;const fresh=save.log.slice(0,k);const brief=fresh.filter(l=>!l.startsWith('[월급]')&&!/주사위 \d/.test(l)).reverse().map(l=>l.replace(/^\[(AI|적)\]\s*/,'')).join(' · ');trioFeed=[`${sideName(now,cur)}: ${brief||'이동만'}`];}
    if(!involved){now.battleResult=null;now.act=null;}
    else if(now.act&&!(trio&&trioFF&&!((b&&(b.attacker===0||b.defender===0))||now.phase==='strike')))showBanner(now.act); // FF: only fights keep the banner
    const comp=trio&&stageById(now.stageId).compress,fight=b&&(b.attacker===0||b.defender===0)||now.phase==='strike';
    if(steps>=1&&steps<=4&&(involved?true:!(trioFF||comp))){startTravel(cur,from,steps,!involved||(trioFF&&!fight));if(fx)fx.involved=involved;}
    else {preserveScroll=true;render();queueAi();}
  },trio()&&trioFF?40:90);
  function trio(){return isTrio(save.match);}
}
// Touch focus must not scroll the dock before render captures its position.
// Keyboard activation keeps its ordinary focus/navigation behavior.
root.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-action]');if(el&&['next-unit','select-unit','select-item'].includes(el.dataset.action))e.preventDefault();});
root.addEventListener('click',e=>{const first=!audioReady;unlockAudio();audioReady=true;if(first){heardSalary=-1;cueSalary();}const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const act=el.dataset.action;if(fx&&fx.until&&Date.now()>fx.until){clearFxTimer();fx=null;}if(fx&&act!=='mute'&&act!=='trio-ff')return;if(MUTATING.has(act)&&Date.now()<actLock)return;if(MUTATING.has(act))actLock=Date.now()+320;try{status='';doAction(act,el.dataset.id,el);}catch(err){status=err.message;render();}});
root.addEventListener('change',async e=>{if(e.target.id==='collection-sort'){collectionSort=e.target.value;preserveScroll=true;render();return;}if(e.target.id!=='import-file')return;const file=e.target.files?.[0];if(!file)return;
 try{const next=loadSave(await file.text());save=next;sheet=null;story=null;selectedUnit=null;selectedItem=null;page='home';status='백업에서 진행 기록을 복구했습니다.';}catch(err){status=`복원 취소: ${err.message}`;}render();});
render();
queueAi();





