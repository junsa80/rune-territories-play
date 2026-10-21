import {VERSION, CARDS, CARD_LIST, STAGES, RING, ELEMENTS, RARITY_NAMES, DUST_COST, DECK_SIZE, COPY_LIMIT} from './data.js';
import {newSave, loadSave, startMatch, roll, playSpell, legalSpell, placementOptions, place, upgrade, combatPreview, invade, pass, aiTurn, goldScore, getLandedTile, availableItem, validateDeck, editDeck, craft, selectTicket, endMatch, surrender} from './game.js';
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
let page=save.match?'game':'home',difficulty='normal',stageSelected=1,selectedUnit=null,selectedItem=null,status=!storageAvailable?'로컬 저장소를 사용할 수 없어 자동 저장이 비활성화되었습니다. JSON 백업을 이용하세요.':droppedMatch?'저장된 대전은 이어갈 수 없어 캠페인 기록만 복구했습니다.':'';
let preserveScroll=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&'+'amp;','<':'&'+'lt;','>':'&'+'gt;','"':'&'+'quot;',"'":'&'+'#39;'}[c]));}
function persist(){if(recoveryRaw!==null||!storageAvailable)return;try{localStorage.setItem(KEY,JSON.stringify(save));}catch(e){status='자동 저장 실패: 브라우저 용량/권한 확인';}}
function btn(label,act,extra='',cls=''){return `<button class="${cls}" data-action="${act}" ${extra}>${esc(label)}</button>`;}
function badge(s){return `<span class="tag r-${s.toLowerCase()}">${RARITY_NAMES[s]}</span>`;}
function kind(c){return c.kind==='unit'?'유닛':c.kind==='spell'?'주문':'아이템';}
function cardMini(id,controls=''){const c=CARDS[id];return `<div class="mini-card"><div class="card-title">${badge(c.rarity)} <b>${esc(c.name)}</b></div><div class="small">${ELEMENTS[c.element]} · ${kind(c)} · ${c.cost}G${c.kind==='unit'?` · ${c.atk}/${c.hp}`:''}</div><div class="card-desc">${esc(c.desc)}</div>${controls}</div>`;}
function nav(){return `<header class="topbar"><div><b>✦ 룬 영토</b><span class="sub"> Alpha ${VERSION}</span></div><div class="nav">${btn('캠페인','home','','navbtn')}${btn('덱·도감','collection','','navbtn')}${btn('로그','logs','','navbtn')}${btn('백업','backup','','navbtn')}</div></header>`;}
function home(){const p=save.progress;return `<section class="intro"><h1>영토와 카드의 전술</h1><p>1인용 모바일 웹 프로토타입. <b>영토 선점·자원 투자·침략</b>을 선택하는 1:1 AI 캠페인입니다.</p><div class="pills"><span>🪙 재료 ${save.dust}</span><span>🎟️ 선택권 ${save.tickets}</span><span>🃏 덱 ${save.deck.length}/${DECK_SIZE}</span></div></section>${save.match?`<div class="notice">진행 중인 대전이 있습니다. ${btn('대전 계속','continue')}</div>`:''}
<section class="section"><h2>캠페인</h2><div class="stage-grid">${STAGES.map(st=>{const lock=st.id>p.highestUnlocked,won=p.wins[st.id]||0;return `<article class="stage"><div class="stage-head"><b>${st.id}. ${esc(st.name)}</b><span>${lock?'🔒':p.cleared.includes(st.id)?'✓ 클리어':'도전 가능'}</span></div><p>${esc(st.focus)} · 상대: ${esc(st.enemy)}</p><p class="small">승리 ${won}회 · 반복 3승마다 선택권 1장 (첫 승 이후) · 일일 첫 승리 보상 ×2</p><div class="stage-buttons">${btn('일반 대전','start',`data-stage="${st.id}" data-diff="normal" ${lock||!!save.match?'disabled':''}`)}${btn('어려움','start',`data-stage="${st.id}" data-diff="hard" ${lock||!p.cleared.includes(st.id)||!!save.match?'disabled':''}`,'outline')}</div></article>`;}).join('')}</div></section>${rewardHTML()}<section class="section"><h2>알파 0.1 범위</h2><p class="small">현재는 <b>16칸 보드·카드 26종·스테이지 3개</b>로 핵심 규칙을 검증합니다. 컬드셉트 전체 규칙을 복제하지 않았으며, 종족/복합 종족·맵 확장·복잡한 전투 연계는 후속 연구 항목입니다.</p></section>`;}
function rewardHTML(){const r=save.lastReward;if(!r)return '';if(r.loss)return `<section class="notice">최근 경기: 패배 · 제작 재료 +${r.dust}</section>`;
 const counters={};for(const v of r.pulled||[]){const c=CARDS[v.id];const k=`${c.rarity}:${v.id}:${v.converted?'dust':'card'}`;counters[k]=(counters[k]||0)+1;}
 return `<section class="section rewards"><h2>최근 획득 보상</h2><p>스테이지 ${r.stageId} 카드팩 ${r.packs}개${r.daily?' · 오늘 첫 승리 ×2':''}${r.first?' · 최초 클리어':''}${r.ticket?' · 선택권 +1':''}</p><p class="small">이 팩은 방금 이긴 스테이지 카드만 나옵니다. 선택권과 제작은 이미 클리어한 스테이지 전체입니다.</p>${r.key?`<p class="key-reward">확정 공략 카드: <b>${esc(CARDS[r.key.id].name)}</b>${r.key.converted?' (보유 상한 → 재료)':''}</p>`:''}<div class="reward-grid">${Object.entries(counters).map(([k,v])=>{const [rarity,id,type]=k.split(':');return `<div class="reward-row">${badge(rarity)} ${esc(CARDS[id].name)} ×${v} ${type==='dust'?'↪ 재료':''}</div>`;}).join('')}</div></section>`;
}
function board(m){let cells=[];const actor=m.players[m.current];for(let i=0;i<16;i++){const [r,c]=RING[i],t=m.tiles[i],occupier=t.owner===null?'빈 영토':CARDS[t.cardId].name;
  const here=m.phase==='land'&&actor.pos===i?' here':'';
  const markers=(m.players[0].pos===i?'<span class="pawn me" title="플레이어">●</span>':'')+(m.players[1].pos===i?'<span class="pawn ai" title="AI">●</span>':'');
  cells.push(`<div class="tile el-${t.element} owner-${t.owner===null?'none':t.owner}${here}" style="grid-row:${r+1};grid-column:${c+1}" title="${esc(occupier)}"><div class="tile-top"><span>${ELEMENTS[t.element]}</span><b>${t.level?'★'.repeat(t.level):''}</b></div><div class="tile-unit">${t.owner===null?(i===0||i===8?'거점':'◇'):esc(CARDS[t.cardId].name)}</div><div class="tile-pawns">${markers}</div></div>`);}
 return `<div class="board" role="img" aria-label="16칸 순환형 영토 보드">${cells.join('')}<div class="board-center"><div>라운드 <b>${m.round}/${STAGES[m.stageId-1].maxRounds}</b></div><div class="score-me">나 ${goldScore(m,0)}점</div><div class="score-ai">AI ${goldScore(m,1)}점</div><div class="small">목표 ${STAGES[m.stageId-1].target+(m.difficulty==='hard'?180:0)}점</div></div></div>`;
}
function fightControls(m){const p=m.players[0],t=getLandedTile(save);
 const units=[...new Set(p.hand.filter(id=>CARDS[id].kind==='unit'))];const items=availableItem(save);if(selectedUnit&&!units.includes(selectedUnit))selectedUnit=null;
 if(selectedItem&&!items.includes(selectedItem))selectedItem=null;
 if(!selectedUnit)selectedUnit=units[0]||null;
 let pv=null;try{if(selectedUnit)pv=combatPreview(save,selectedUnit,selectedItem);}catch(e){}
 const options=units.map(id=>btn(CARDS[id].name, 'select-unit',`data-id="${id}"` ,id===selectedUnit?'chosen':'' )).join('');
 const itemOptions=[btn('아이템 없음','select-item','data-id=""',!selectedItem?'chosen':'') , ...items.map(id=>btn(CARDS[id].name,'select-item',`data-id="${id}"`,selectedItem===id?'chosen':''))].join('');
 return `<div class="prompt"><b>적 영토: ${esc(CARDS[t.cardId].name)} Lv.${t.level}</b><p class="small">침략 또는 통행료 지불. 전투는 확정 판정(주사위 조작 없음).</p><div class="choices">${options||'손패에 침략용 유닛이 없습니다.'}</div><div class="choices">${itemOptions}</div>${pv?`<p class="preview ${pv.success?'win':'lose'}">예상 ${pv.success?'침략 성공':'침략 실패'} · 공격 ${pv.attack}/${pv.defenderHP} · 생존 ${pv.defense}/${pv.retaliation} · 비용 ${pv.cost}G</p>`:''}<div class="action-row">${btn('침략 실행','invade',`${pv&&pv.cost<=p.gold?'':'disabled'}`)}${btn(`통행료 내기 (${t.level*35+20}G)`,'pass','','outline')}</div></div>`;
}
function turnUI(m){const p=m.players[0];if(m.ended)return `<div class="prompt"><h2>${m.winner===0?'🏆 승리!':'패배 — 다시 연구해 보자'}</h2><p>${esc(m.reason)} · 최종 점수 ${goldScore(m,0)} : ${goldScore(m,1)}</p>${btn('캠페인으로','finish')}</div>`;
 if(m.current===1)return '<div class="prompt">AI가 판단 중입니다…</div>';
 if(m.phase==='prep'){const spells=p.hand.filter(id=>legalSpell(save,id));return `<div class="prompt"><b>이동 준비</b><p class="small">한 턴에 주문 1장 사용 가능. 먼저 주문을 사용하거나 주사위를 굴리세요.</p><div class="choices">${spells.map(id=>btn(`${CARDS[id].name} (${CARDS[id].cost}G)`,'spell',`data-id="${id}"`,'outline')).join('')}</div>${btn('🎲 주사위 굴리기','roll','','primary')}</div>`;}
 const t=getLandedTile(save);if(t.index===0||t.index===8)return `<div class="prompt"><b>거점에 도착했어요.</b><p class="small">이 칸은 영토를 소유할 수 없습니다.</p>${btn('턴 종료','pass')}</div>`;
 if(t.owner===null){const opts=placementOptions(save);return `<div class="prompt"><b>빈 영토 · ${ELEMENTS[t.element]}</b><p class="small">배치하려는 유닛을 선택하세요. 같은 속성 영토는 전투 보너스를 받습니다.</p><div class="choices">${[...new Set(opts)].map(id=>btn(`${CARDS[id].name} (${CARDS[id].cost}G)`,'place',`data-id="${id}"`)).join('')||'현재 배치 가능한 손패 유닛이 없어요.'}</div>${btn('배치하지 않기','pass','','outline')}</div>`;}
 if(t.owner===0){const cost=45*t.level;return `<div class="prompt"><b>내 영토 Lv.${t.level}</b><p class="small">강화하면 영토 가치·방어력·통행료가 증가합니다.</p><div class="action-row">${btn(`강화 (${cost}G)`,'upgrade',`${t.level>=3||p.gold<cost?'disabled':''}`)}${btn('유지','pass','','outline')}</div></div>`;}
 return fightControls(m);
}
function game(){const m=save.match;if(!m)return home();const p=m.players[0];return `<section class="game-area"><div class="game-header"><b>${esc(STAGES[m.stageId-1].name)} · ${m.difficulty==='hard'?'어려움':'일반'}</b><span>💰 ${p.gold}G · AI ${m.players[1].gold}G</span></div><div class="game-layout">${board(m)}<div class="game-side"><div class="dock">${turnUI(m)}</div><div class="hand"><b>손패 (${p.hand.length})</b><div class="hand-row">${p.hand.map(id=>cardMini(id)).join('')||'<p>손패 없음</p>'}</div></div><details class="battle-log"><summary>전투 로그 (최근 기록)</summary><div>${save.log.slice(0,12).map(s=>`<p>${esc(s)}</p>`).join('')}</div></details><div class="small muted">자동 저장: 이 브라우저 로컬 전용. 게임 중 탭을 닫아도 이어서 진행합니다.</div>${!m.ended?btn('항복 (무보상)','surrender','','quiet'):''}</div></div></section>`;}
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
  root.innerHTML=nav()+(status?`<div class="status" role="alert">${esc(status)} ${btn('닫기','dismiss','','quiet')}</div>`:'')+(page==='home'?home():page==='game'?game():page==='collection'?collection():page==='logs'?logs():backup())+(page==='game'?'':`<footer>Rune Territories · Original prototype · ${VERSION} · GitHub handoff ready</footer>`);
  if(preserveScroll){
    const apply=()=>{window.scrollTo(0,y);const h=document.querySelector('.hand-row');if(h)h.scrollLeft=hx;const g=document.querySelector('.game-side');if(g)g.scrollTop=sy;};
    apply(); requestAnimationFrame(apply);
  }
  preserveScroll=false;
}
function doAction(act,id,el){
  preserveScroll=!['home','collection','logs','backup','finish','surrender','start','reset','recover-reset','continue','recover-export'].includes(act);
  switch(act){
 case 'recover-export':{const b=new Blob([recoveryRaw],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='rune-territories-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return;}
 case 'recover-reset':if(confirm('복구 JSON을 내려받아 안전하게 저장했나요? 새 게임을 시작하면 기존 데이터가 바뀝니다.')){recoveryRaw=null;save=newSave();page='home';status='새 게임을 시작했습니다.';}break;
 case 'home':page='home';break;
 case 'collection':page='collection';break;
 case 'logs':page='logs';break;
 case 'backup':page='backup';break;
 case 'dismiss':status='';break;
 case 'continue':page='game';break;
 case 'start':startMatch(save,Number(el.dataset.stage),el.dataset.diff);selectedUnit=null;selectedItem=null;page='game';break;
 case 'spell':playSpell(save,id);break;
 case 'roll':roll(save);break;
 case 'place':place(save,id);break;
 case 'upgrade':upgrade(save);break;
 case 'pass':pass(save);break;
 case 'select-unit':selectedUnit=id;break;
 case 'select-item':selectedItem=id||null;break;
 case 'invade':if(!selectedUnit)throw new Error('침략 유닛을 선택하세요.');invade(save,selectedUnit,selectedItem);selectedUnit=null;selectedItem=null;break;
 case 'finish':endMatch(save);page='home';break;
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
let actLock=0, aiTimer=null;
function queueAi(){
  if(aiTimer||!save.match||save.match.current!==1||save.match.ended) return;
  aiTimer=setTimeout(()=>{
    aiTimer=null;
    if(!save.match||save.match.current!==1||save.match.ended) return;
    try{aiTurn(save);status='';}catch(e){status=`AI 오류: ${e.message}`;}
    preserveScroll=true;render();
  },90);
}
root.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const act=el.dataset.action;if(MUTATING.has(act)&&Date.now()<actLock)return;if(MUTATING.has(act))actLock=Date.now()+320;try{status='';doAction(act,el.dataset.id,el);}catch(err){status=err.message;render();}});
root.addEventListener('change',async e=>{if(e.target.id!=='import-file')return;const file=e.target.files?.[0];if(!file)return;
 try{const next=loadSave(await file.text());validateDeck(next);save=next;page='home';status='백업에서 진행 기록을 복구했습니다.';}catch(err){status=`복원 취소: ${err.message}`;}render();});
render();
queueAi();
