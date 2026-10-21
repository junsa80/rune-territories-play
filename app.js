import {VERSION, CARDS, CARD_LIST, STAGES, RING, ELEMENTS, RARITY_NAMES, DUST_COST, DECK_SIZE, COPY_LIMIT} from './data.js';
import {newSave, loadSave, startMatch, roll, playSpell, legalSpell, placementOptions, place, upgrade, combatPreview, invade, pass, aiTurn, goldScore, getLandedTile, availableItem, validateDeck, editDeck, craft, selectTicket, endMatch, surrender} from './game.js';
import {unlockAudio, sfx, toggleMute, muted} from './audio.js';
const KEY='rune-territories.save.v1';
const root=document.querySelector('#app');
let save, recoveryRaw=null, storageAvailable=true, initialRaw=null, droppedMatch=false;
try{initialRaw=localStorage.getItem(KEY);}catch(e){storageAvailable=false;console.warn('Local storage unavailable:',e);}
function matchLooksPlayable(m){
  if(!m||m.ended||!Array.isArray(m.players)||m.players.length!==2||!Array.isArray(m.tiles)||m.tiles.length!==16) return false;
  if(!STAGES.some(st=>st.id===m.stageId)||!['normal','hard'].includes(m.difficulty)||!['prep','land'].includes(m.phase)) return false;
  const known=ids=>Array.isArray(ids)&&ids.every(id=>!!CARDS[id]);
  for(const p of m.players){
    if(!p||typeof p.gold!=='number'||!known(p.hand)||!known(p.deck)||!known(p.discard||[])) return false;
  }
  return m.tiles.every(t=>t&&(t.owner==null||!!CARDS[t.cardId]));
}
function keepReward(r){
  if(!r||typeof r!=='object') return null;
  if(r.loss) return {stageId:r.stageId,loss:true,dust:Number(r.dust)||0};
  const key=r.key&&CARDS[r.key.id]?r.key:null;
  const pulled=Array.isArray(r.pulled)?r.pulled.filter(x=>x&&CARDS[x.id]):[];
  return {...r,key,pulled};
}
function loadForLocal(s){const m=s.match,reward=keepReward(s.lastReward);const v=loadSave(s);if(reward)v.lastReward=reward;if(matchLooksPlayable(m))v.match=m;else if(m)droppedMatch=true;return v;}
try{save=initialRaw?loadForLocal(JSON.parse(initialRaw)):newSave();}catch(e){console.warn('Save read error, original retained:',e);recoveryRaw=initialRaw;save=newSave();}
let page=save.match?'game':'home',difficulty='normal',stageSelected=1,previewStage=1,selectedUnit=null,selectedItem=null,sheet=null,status=!storageAvailable?'로컬 저장소를 사용할 수 없어 자동 저장이 비활성화되었습니다. JSON 백업을 이용하세요.':droppedMatch?'저장된 대전은 이어갈 수 없어 캠페인 기록만 복구했습니다.':'';
let preserveScroll=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&'+'amp;','<':'&'+'lt;','>':'&'+'gt;','"':'&'+'quot;',"'":'&'+'#39;'}[c]));}
function persist(){if(recoveryRaw!==null||!storageAvailable)return;try{localStorage.setItem(KEY,JSON.stringify(save));}catch(e){status='자동 저장 실패: 브라우저 용량/권한 확인';}}
function btn(label,act,extra='',cls=''){return `<button class="${cls}" data-action="${act}" ${extra}>${esc(label)}</button>`;}
function badge(s){return `<span class="tag r-${s.toLowerCase()}">${RARITY_NAMES[s]}</span>`;}
function kind(c){return c.kind==='unit'?'유닛':c.kind==='spell'?'주문':'아이템';}
const STAGE_FACE={1:'leo',2:'mira',3:'ar'};
function cardSrc(id){return `./art/cards/${id}.png`;}
function faceSrc(name){return `./art/chars/${name}.png`;}
function artTag(src, alt, cls){return `<img class="${cls}" src="${src}" alt="${esc(alt)}" draggable="false">`;}
function cardMini(id,controls='',attrs=''){const c=CARDS[id];return `<div class="mini-card" ${attrs}>${artTag(cardSrc(id),c.name,'card-art')}<div class="card-title">${badge(c.rarity)} <b>${esc(c.name)}</b></div><div class="small">${ELEMENTS[c.element]} · ${kind(c)} · ${c.cost}G${c.kind==='unit'?` · ${c.atk}/${c.hp}`:''}</div><div class="card-desc">${esc(c.desc)}</div>${controls}</div>`;}
function nav(){return `<header class="topbar"><div><b>✦ 룬 영토</b><span class="sub"> Alpha ${VERSION}</span> ${btn(muted()?'소리 끔':'소리 켬','mute','','quiet')}</div><div class="nav">${btn('캠페인','home','','navbtn')}${btn('덱·도감','collection','','navbtn')}${btn('로그','logs','','navbtn')}${btn('백업','backup','','navbtn')}</div></header>`;}
function home(){const p=save.progress;return `<section class="intro"><h1>영토와 카드의 전술</h1><p>1인용 모바일 웹 프로토타입. <b>영토 선점·자원 투자·침략</b>을 선택하는 1:1 AI 캠페인입니다.</p><div class="pills"><span>🪙 재료 ${save.dust}</span><span>🎟️ 선택권 ${save.tickets}</span><span>🃏 덱 ${save.deck.length}/${DECK_SIZE}</span></div></section>${save.match?`<div class="notice">진행 중인 대전이 있습니다. ${btn('대전 계속','continue')}</div>`:''}
<section class="section"><h2>캠페인</h2><div class="stage-grid">${STAGES.map(st=>{const lock=st.id>p.highestUnlocked,won=p.wins[st.id]||0;return `<article class="stage"><div class="stage-head"><b>${st.id}. ${esc(st.name)}</b><span>${lock?'🔒':p.cleared.includes(st.id)?'✓ 클리어':'도전 가능'}</span></div><p>${esc(st.focus)} · 상대: ${esc(st.enemy)}</p><p class="small">승리 ${won}회 · 반복 3승마다 선택권 1장 (첫 승 이후) · 일일 첫 승리 보상 ×2</p><div class="stage-buttons">${btn('카드 확인','deckcheck',`data-stage="${st.id}" ${lock?'disabled':''}`,'outline')}${btn('일반 대전','start',`data-stage="${st.id}" data-diff="normal" ${lock||!!save.match?'disabled':''}`)}${btn('어려움','start',`data-stage="${st.id}" data-diff="hard" ${lock||!p.cleared.includes(st.id)||!!save.match?'disabled':''}`,'outline')}</div></article>`;}).join('')}</div></section>${rewardHTML()}<section class="section"><h2>알파 0.1 범위</h2><p class="small">현재는 <b>16칸 보드·카드 26종·스테이지 3개</b>로 핵심 규칙을 검증합니다. 컬드셉트 전체 규칙을 복제하지 않았으며, 종족/복합 종족·맵 확장·복잡한 전투 연계는 후속 연구 항목입니다.</p></section>`;}
function rewardHTML(){const r=save.lastReward;if(!r)return '';if(r.loss)return `<section class="notice">최근 경기: 패배 · 제작 재료 +${r.dust}</section>`;
 const counters={};for(const v of r.pulled||[]){const c=CARDS[v.id];const k=`${c.rarity}:${v.id}:${v.converted?'dust':'card'}`;counters[k]=(counters[k]||0)+1;}
 return `<section class="section rewards"><h2>최근 획득 보상</h2><p>스테이지 ${r.stageId} 카드팩 ${r.packs}개${r.daily?' · 오늘 첫 승리 ×2':''}${r.first?' · 최초 클리어':''}${r.ticket?' · 선택권 +1':''}</p><p class="small">이 팩은 방금 이긴 스테이지 카드만 나옵니다. 선택권과 제작은 이미 클리어한 스테이지 전체입니다.</p>${r.key?`<p class="key-reward">확정 공략 카드: <b>${esc(CARDS[r.key.id].name)}</b>${r.key.converted?' (보유 상한 → 재료)':''}</p>`:''}<div class="reward-grid">${Object.entries(counters).map(([k,v])=>{const [rarity,id,type]=k.split(':');return `<div class="reward-row">${badge(rarity)} ${esc(CARDS[id].name)} ×${v} ${type==='dust'?'↪ 재료':''}</div>`;}).join('')}</div></section>`;
}
function shownPos(m,who){if(fx&&fx.who===who) return (fx.from+fx.tick)%RING.length; return m.players[who].pos;}
function dieHTML(){if(!fx) return ''; return `<div class="die ${fx.rolling?'rolling':'landed'}" data-face="${fx.face}" aria-hidden="true"><b class="die-face">${fx.face}</b></div>`;}
function board(m){let cells=[];const focus=fx?(fx.from+fx.tick)%RING.length:(m.phase==='land'?m.players[m.current].pos:-1);for(let i=0;i<16;i++){const [r,c]=RING[i],t=m.tiles[i],occupier=t.owner===null?'빈 영토':CARDS[t.cardId].name;
  const here=focus===i?' here':'';
  const hop0=fx&&fx.who===0&&!fx.rolling&&shownPos(m,0)===i?' hop':'';
  const hop1=fx&&fx.who===1&&!fx.rolling&&shownPos(m,1)===i?' hop':'';
  const markers=(shownPos(m,0)===i?artTag(faceSrc('player'),'나','pawn me'+hop0):'')+(shownPos(m,1)===i?artTag(faceSrc(STAGE_FACE[m.stageId]||'leo'),'AI','pawn ai'+hop1):'');
  const summon=t.cardId?artTag(cardSrc(t.cardId),CARDS[t.cardId].name,'summon'):'';
  cells.push(`<div class="tile el-${t.element} owner-${t.owner===null?'none':t.owner}${here}" style="grid-row:${r+1};grid-column:${c+1}" title="${esc(occupier)}"><div class="tile-top"><span>${ELEMENTS[t.element]}</span><b>${t.level?'★'.repeat(t.level):''}</b></div><div class="tile-art">${summon}</div><div class="tile-unit">${t.owner===null?(i===0||i===8?'거점':'빈 땅'):esc(CARDS[t.cardId].name)}</div><div class="tile-pawns">${markers}</div></div>`);}
 return `<div class="board" role="img" aria-label="16칸 순환형 영토 보드">${cells.join('')}<div class="board-center">${artTag(faceSrc(m.current?STAGE_FACE[m.stageId]||'leo':'player'), m.current?'상대':'나','center-face')}<div>라운드 <b>${m.round}/${STAGES[m.stageId-1].maxRounds}</b></div><div class="score-me">나 ${goldScore(m,0)}점</div><div class="score-ai">AI ${goldScore(m,1)}점</div><div class="small">목표 ${STAGES[m.stageId-1].target+(m.difficulty==='hard'?180:0)}점</div></div>${dieHTML()}</div>`;
}
function fightControls(m){const p=m.players[0],t=getLandedTile(save);
 const units=[...new Set(p.hand.filter(id=>CARDS[id].kind==='unit'))];const items=availableItem(save);if(selectedUnit&&!units.includes(selectedUnit))selectedUnit=null;
 if(selectedItem&&!items.includes(selectedItem))selectedItem=null;
 if(!selectedUnit)selectedUnit=units[0]||null;
 let pv=null;try{if(selectedUnit)pv=combatPreview(save,selectedUnit,selectedItem);}catch(e){}
 const options=units.map(id=>btn(CARDS[id].name, 'inspect',`data-id="${id}" data-intent="invade"` ,id===selectedUnit?'chosen':'' )).join('');
 const itemOptions=[btn('아이템 없음','select-item','data-id=""',!selectedItem?'chosen':'') , ...items.map(id=>btn(CARDS[id].name,'inspect',`data-id="${id}" data-intent="item"`,selectedItem===id?'chosen':''))].join('');
 return `<div class="prompt"><div class="go">${btn('침략 실행','invade',`${pv&&pv.cost<=p.gold?'':'disabled'}`)}${btn(`통행료 ${t.level*35+20}G`,'pass','','outline')}</div><div class="prompt-main"><b>적 영토: ${esc(CARDS[t.cardId].name)} Lv.${t.level}</b><div class="choices">${options||'손패에 침략용 유닛이 없습니다.'}</div><div class="choices">${itemOptions}</div>${pv?`<p class="preview ${pv.success?'win':'lose'}">예상 ${pv.success?'성공':'실패'} · 공격 ${pv.attack}/${pv.defenderHP} · 생존 ${pv.defense}/${pv.retaliation} · ${pv.cost}G</p>`:''}</div></div>`;
}
function turnUI(m){const p=m.players[0];if(fx) return `<div class="prompt"><b>${fx.who?'상대':'나'} ${fx.rolling?'주사위를 굴리는 중':'이동 중'} · ${fx.face}</b></div>`;if(m.ended)return `<div class="prompt"><div class="go">${btn('캠페인으로','finish','','primary')}</div><div class="prompt-main"><b>${m.winner===0?'승리':'패배'}</b><p class="small">${esc(m.reason)} · ${goldScore(m,0)} : ${goldScore(m,1)}</p></div></div>`;
 if(m.current===1)return '<div class="prompt">AI가 판단 중입니다…</div>';
 if(m.phase==='prep'){const spells=p.hand.filter(id=>legalSpell(save,id));const pay=m.salaryNotice?`<span class="salary">월급 +${m.salaryNotice}G</span>`:'';return `<div class="prompt"><div class="go">${btn('주사위 굴리기','roll','','primary')}</div><div class="prompt-main"><b>이동 준비</b>${pay}${spells.length?`<div class="choices">${spells.map(id=>btn(`${CARDS[id].name} 보기`,'inspect',`data-id="${id}" data-intent="spell"`,'outline')).join('')}</div>`:''}</div></div>`;}
 const t=getLandedTile(save);if(t.index===0||t.index===8)return `<div class="prompt"><div class="go">${btn('턴 종료','pass','','primary')}</div><div class="prompt-main"><b>거점</b><p class="small">이 칸에는 영토를 둘 수 없습니다.</p></div></div>`;
 if(t.owner===null){const opts=placementOptions(save);return `<div class="prompt"><div class="go">${btn('배치하지 않기','pass','','outline')}</div><div class="prompt-main"><b>빈 영토 · ${ELEMENTS[t.element]}</b><div class="choices">${[...new Set(opts)].map(id=>btn(`${CARDS[id].name} 보기`,'inspect',`data-id="${id}" data-intent="place"`)).join('')||'배치할 손패 유닛이 없습니다.'}</div></div></div>`;}
 if(t.owner===0){const cost=45*t.level;return `<div class="prompt"><div class="go">${btn(`강화 ${cost}G`,'upgrade',`${t.level>=3||p.gold<cost?'disabled':''}`)}${btn('유지','pass','','outline')}</div><div class="prompt-main"><b>내 영토 Lv.${t.level}</b></div></div>`;}
 return fightControls(m);
}
function game(){const m=save.match;if(!m)return home();const p=m.players[0];return `<section class="game-area"><div class="game-header"><b>${esc(STAGES[m.stageId-1].name)} · ${m.difficulty==='hard'?'어려움':'일반'}</b><span>💰 ${p.gold}G · AI ${m.players[1].gold}G</span>${!m.ended?btn('항복','surrender','','quiet small-button'):''}</div><div class="game-layout">${board(m)}<div class="game-side"><div class="dock">${turnUI(m)}</div><div class="hand"><b>손패 ${p.hand.length}</b><div class="hand-row">${p.hand.map(id=>cardMini(id,'',`data-action="inspect" data-id="${id}" data-intent="view"`)).join('')||'<p>손패 없음</p>'}</div></div><details class="battle-log"><summary>전투 로그</summary><div>${save.log.slice(0,12).map(s=>`<p>${esc(s)}</p>`).join('')}</div></details></div></div></section>`;}
function deckCheck(){const st=STAGES.find(x=>x.id===previewStage)||STAGES[0];return `<section class="section"><h1>대전 전 카드 확인</h1><div class="boss-row">${artTag(faceSrc(STAGE_FACE[st.id]),st.enemy,'boss-face')}<div><b>${esc(st.name)}</b><p>상대 ${esc(st.enemy)} · ${esc(st.focus)}</p><p class="small">내 덱의 그림과 능력을 확인한 다음 대전을 시작하세요.</p></div></div><div class="collection-grid">${save.deck.map(id=>cardMini(id, btn('크게 보기','inspect',`data-id="${id}" data-intent="view"`,'small-button outline'))).join('')}</div><div class="action-row">${btn('이 덱으로 일반 대전','start',`data-stage="${st.id}" data-diff="normal" ${save.match?'disabled':''}`,'primary')}${btn('캠페인으로','home','','outline')}</div></section>`;}
function sheetHTML(){if(!sheet||!CARDS[sheet.id])return '';const c=CARDS[sheet.id];let play='';
 if(sheet.intent==='place') play=btn('확인하고 배치','place',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='spell') play=btn('확인하고 주문','spell',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='invade') play=btn('이 카드로 침략','invade',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='item') play=btn('이 아이템 선택','select-item',`data-id="${c.id}"`,'primary');
 let preview='';
 if(sheet.intent==='invade'&&save.match){try{const pv=combatPreview(save,c.id,selectedItem);preview=`<p class="preview ${pv.success?'win':'lose'}">예상 ${pv.success?'침략 성공':'침략 실패'} · 공격 ${pv.attack}/${pv.defenderHP} · 생존 ${pv.defense}/${pv.retaliation} · 비용 ${pv.cost}G</p>`;}catch(e){preview=`<p class="small">${esc(e.message)}</p>`;}}
 return `<div class="sheet-back" data-action="sheet-close"><article class="sheet" data-action="noop">${artTag(cardSrc(c.id),c.name,'sheet-art')}<div class="card-title">${badge(c.rarity)} <b>${esc(c.name)}</b></div><p>${ELEMENTS[c.element]} · ${kind(c)} · ${c.cost}G${c.kind==='unit'?` · 공격 ${c.atk} / 생명 ${c.hp}`:''}</p><p>${esc(c.desc)}</p>${preview}<div class="action-row">${play}${btn('닫기','sheet-close','','outline')}</div></article></div>`;}
function collection(){const counts={};save.deck.forEach(id=>counts[id]=(counts[id]||0)+1);
 const known=CARD_LIST.filter(c=>save.progress.cleared.includes(c.stage)||(save.collection[c.id]||0)>0);
 return `<section class="section"><h1>카드 컬렉션 · 덱 편집</h1><p>덱 ${save.deck.length}/${DECK_SIZE}장 · 제작 재료 ${save.dust} · 카드 선택권 ${save.tickets}장</p><p class="small">선택권은 클리어한 스테이지의 커먼~레어 카드 중에서 선택. 보관 후 사용 가능. 레전더리도 최대 4장까지 수집 가능.</p>${save.match?'<p class="warning">진행 중인 대전에서는 덱 편집이 잠겨 있습니다.</p>':''}<div class="collection-grid">${known.map(c=>{
  const owned=save.collection[c.id]||0,n=counts[c.id]||0,unlocked=save.progress.cleared.includes(c.stage),canCraft=unlocked&&owned<4&&save.dust>=DUST_COST[c.rarity];
  return cardMini(c.id,`<div class="small">보유 ${owned}/4 · 덱 ${n}/4 · 출처: 스테이지 ${c.stage}</div><div class="action-row mini-actions">${btn('−','deck-minus',`data-id="${c.id}" ${!n||!!save.match?'disabled':''}`,'small-button')}${btn('+','deck-plus',`data-id="${c.id}" ${n>=owned||save.deck.length>=DECK_SIZE||!!save.match?'disabled':''}`,'small-button')}${btn(`제작 ${DUST_COST[c.rarity]}`,'craft',`data-id="${c.id}" ${!canCraft?'disabled':''}`,'small-button outline')}${btn('선택권','ticket',`data-id="${c.id}" ${!unlocked||!['C','U','R'].includes(c.rarity)||!save.tickets||owned>=4?'disabled':''}`,'small-button outline')}</div>`);
 }).join('')}</div><p class="small">승리 카드팩은 그 스테이지 카드만 줍니다. 최초 클리어 핵심 카드는 팩과 따로 나옵니다. 선택권·제작은 클리어한 스테이지 전체에서 고릅니다.</p></section>`;
}
function logs(){return `<section class="section"><h1>게임 로그</h1><p>최신 100개 이벤트만 표시. 개발용 변경 기록은 <code>logs/WORKLOG.md</code>와 <code>HANDOFF.md</code>를 참고.</p><div class="logs">${save.log.map(v=>`<p>${esc(v)}</p>`).join('')}</div></section>`;}
function backup(){return `<section class="section"><h1>백업 · 복원</h1><p>자동 저장은 현재 브라우저 <code>localStorage</code>를 사용하며 클라우드 동기화는 없습니다.</p>${btn('JSON 백업 내려받기','export')}${btn('JSON 가져오기','import','','outline')}<input id="import-file" type="file" accept="application/json,.json" hidden/><p class="small">주의: JSON 가져오기는 수집·클리어·덱을 복구하지만 진행 중이던 경기는 복원하지 않습니다(알파 0.1 규격). 가져오기 전 현재 저장을 반드시 내보내세요.</p><hr/>${btn('처음부터 새로 시작','reset','','danger')}</section>`;}
function render(){
  const y=preserveScroll?window.scrollY:0;
  const hand=document.querySelector('.hand-row'); const hx=hand?hand.scrollLeft:0;
  const side=document.querySelector('.game-side'); const sy=side?side.scrollTop:0;
  persist();
  document.body.classList.toggle('ingame', page==='game'&&!!save.match&&!save.match.ended);
  if(recoveryRaw!==null){root.innerHTML=nav()+`<section class="notice"><h2>이전 저장 데이터 보호</h2><p>현재 프로그램과 호환되지 않는 저장이 발견되어 기존 데이터를 덮어쓰지 않았습니다. 먼저 원본을 내려받아 보관하세요.</p>${btn('기존 JSON 내려받기','recover-export')}${btn('백업 확인 후 새 게임 시작','recover-reset','','danger')}</section>`;preserveScroll=false;return;}
  root.innerHTML=nav()+(status?`<div class="status" role="alert">${esc(status)} ${btn('닫기','dismiss','','quiet')}</div>`:'')+(page==='home'?home():page==='deckcheck'?deckCheck():page==='game'?game():page==='collection'?collection():page==='logs'?logs():backup())+sheetHTML()+(page==='game'?'':`<footer>Rune Territories · Original prototype · ${VERSION}</footer>`);
  if(preserveScroll){
    const apply=()=>{window.scrollTo(0,y);const h=document.querySelector('.hand-row');if(h)h.scrollLeft=hx;const g=document.querySelector('.game-side');if(g)g.scrollTop=sy;};
    apply(); requestAnimationFrame(apply);
  }
  preserveScroll=false;
  cueSalary();
}
function doAction(act,id,el){
  preserveScroll=!['home','collection','logs','backup','finish','surrender','start','reset','recover-reset','continue','recover-export'].includes(act);
  switch(act){
 case 'recover-export':{const b=new Blob([recoveryRaw],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='rune-territories-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return;}
 case 'recover-reset':if(confirm('복구 JSON을 내려받아 안전하게 저장했나요? 새 게임을 시작하면 기존 데이터가 바뀝니다.')){recoveryRaw=null;save=newSave();page='home';status='새 게임을 시작했습니다.';}break;
 case 'home':page='home';sheet=null;break;
 case 'collection':page='collection';sheet=null;break;
 case 'logs':page='logs';break;
 case 'backup':page='backup';break;
 case 'dismiss':status='';break;
 case 'mute':toggleMute();sfx('tap');break;
 case 'deckcheck':previewStage=Number(el.dataset.stage)||1;page='deckcheck';sheet=null;break;
 case 'inspect':sheet={id,intent:el.dataset.intent||'view'};if(sheet.intent==='invade')selectedUnit=id;if(sheet.intent==='item')selectedItem=id;sfx('tap');break;
 case 'sheet-close':sheet=null;break;
 case 'noop':return;
 case 'continue':page='game';break;
 case 'start':startMatch(save,Number(el.dataset.stage),el.dataset.diff);selectedUnit=null;selectedItem=null;sheet=null;page='game';sfx('tap');break;
 case 'spell':playSpell(save,id);sheet=null;sfx('spell');break;
 case 'roll':{const who=save.match.current,from=save.match.players[who].pos;const steps=roll(save);startTravel(who,from,steps);return;}
 case 'place':place(save,id);sheet=null;sfx('summon');break;
 case 'upgrade':upgrade(save);sfx('upgrade');break;
 case 'pass':pass(save);sfx('tap');break;
 case 'select-unit':selectedUnit=id;sheet=null;break;
 case 'select-item':selectedItem=id||null;sheet=null;sfx('tap');break;
 case 'invade':if(id)selectedUnit=id;if(!selectedUnit)throw new Error('침략 유닛을 선택하세요.');{const ok=invade(save,selectedUnit,selectedItem);sfx(ok?'hit':'fail');}selectedUnit=null;selectedItem=null;sheet=null;break;
 case 'finish':{const won=save.match?.winner===0;endMatch(save);page='home';sheet=null;sfx(won?'win':'lose');}break;
 case 'surrender':if(confirm('항복하면 보상을 받지 못합니다. 대전을 종료할까요?')){surrender(save);page='home';}break;
 case 'deck-plus':editDeck(save,id,1);break;
 case 'deck-minus':editDeck(save,id,-1);break;
 case 'craft':craft(save,id);break;
 case 'ticket':selectTicket(save,id);break;
 case 'export':{const blob=new Blob([JSON.stringify({...save,match:null,lastReward:null},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='rune-territories-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status='수집·덱·진행 기록을 JSON으로 내보냈습니다.';break;}
 case 'import':document.getElementById('import-file').click();return;
 case 'reset':if(confirm('모든 진행 데이터를 초기화할까요? (복구 불가)')){save=newSave();page='home';status='새 게임을 시작했습니다.';}break;
 }render();queueAi();}
const MUTATING=new Set(['spell','roll','place','upgrade','pass','invade','start','finish','surrender','deck-plus','deck-minus','craft','ticket','reset','recover-reset']);
let actLock=0, aiTimer=null, audioReady=false, heardSalary=-1, fx=null, fxTimer=null;
function clearFxTimer(){if(fxTimer){clearTimeout(fxTimer);fxTimer=null;}}
function startTravel(who,from,steps){
  clearFxTimer();
  if(!(steps>=1&&steps<=4)){fx=null;preserveScroll=true;render();return;}
  fx={who,from,steps,tick:0,face:1,rolling:true};
  preserveScroll=true;render();sfx('dice');
  let spins=0;
  const spin=()=>{
    if(!fx||!fx.rolling) return;
    spins++;
    fx.face=spins>=7?steps:1+Math.floor(Math.random()*4);
    const die=document.querySelector('.die'),face=document.querySelector('.die-face'),label=document.querySelector('.prompt b');
    if(face) face.textContent=String(fx.face);
    if(die) die.dataset.face=String(fx.face);
    if(label) label.textContent=`${fx.who?'상대':'나'} 주사위를 굴리는 중 · ${fx.face}`;
    if(spins>=7){fx.rolling=false;fx.face=steps;if(die){die.classList.remove('rolling');die.classList.add('landed');}if(face) face.textContent=String(steps);fxTimer=setTimeout(hop,360);return;}
    fxTimer=setTimeout(spin,70);
  };
  fxTimer=setTimeout(spin,70);
}
function hop(){
  if(!fx) return;
  if(fx.tick>=fx.steps){fx=null;preserveScroll=true;render();return;}
  fx.tick++;sfx('step');preserveScroll=true;render();
  fxTimer=setTimeout(hop,320);
}
function cueSalary(){const m=save.match;if(fx||!m||m.ended||m.current!==0||!m.salaryNotice)return;if(heardSalary===m.turns)return;heardSalary=m.turns;sfx('salary');}
function queueAi(){
  if(fx||aiTimer||!save.match||save.match.current!==1||save.match.ended) return;
  aiTimer=setTimeout(()=>{
    aiTimer=null;
    if(fx||!save.match||save.match.current!==1||save.match.ended) return;
    const from=save.match.players[1].pos, rolled=save.match.phase==='prep';
    try{aiTurn(save);status='';}catch(e){status=`AI 오류: ${e.message}`;preserveScroll=true;render();return;}
    const steps=rolled?(save.match.players[1].pos-from+RING.length)%RING.length:0;
    if(steps>=1&&steps<=4) startTravel(1,from,steps);
    else {preserveScroll=true;render();}
  },90);
}
root.addEventListener('click',e=>{const first=!audioReady;unlockAudio();audioReady=true;if(first){heardSalary=-1;cueSalary();}const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const act=el.dataset.action;if(fx&&act!=='mute')return;if(MUTATING.has(act)&&Date.now()<actLock)return;if(MUTATING.has(act))actLock=Date.now()+320;try{status='';doAction(act,el.dataset.id,el);}catch(err){status=err.message;render();}});
root.addEventListener('change',async e=>{if(e.target.id!=='import-file')return;const file=e.target.files?.[0];if(!file)return;
 try{const next=loadSave(await file.text());validateDeck(next);save=next;page='home';status='백업에서 진행 기록을 복구했습니다.';}catch(err){status=`복원 취소: ${err.message}`;}render();});
render();
queueAi();
