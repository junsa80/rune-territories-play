import {VERSION, CARDS, CARD_LIST, STAGES, ELEMENTS, RARITY_NAMES, DUST_COST, DECK_SIZE, COPY_LIMIT, TRAITS, STORY, makeBoard, STAGE_PACKS, ACHIEVEMENTS, UPDATES} from './data.js?v=0.1.39';
import {newSave, loadSave, startMatch, roll, playSpell, legalSpell, placementOptions, place, upgrade, declareStrike, answerStrike, pass, aiTurn, goldScore, getLandedTile, validateDeck, editDeck, craft, selectTicket, endMatch, surrender, traitNumbers, claimAchievement, combatPreview, tollOf} from './game.js?v=0.1.39';
import {unlockAudio, sfx, toggleMute, muted} from './audio.js';
const KEY='rune-territories.save.v1';
const root=document.querySelector('#app');
let save, recoveryRaw=null, storageAvailable=true, initialRaw=null, droppedMatch=false;
try{initialRaw=localStorage.getItem(KEY);}catch(e){storageAvailable=false;console.warn('Local storage unavailable:',e);}
function matchLooksPlayable(m){
  const stage=STAGES.find(st=>st.id===m?.stageId);
  const expect=stage?makeBoard(stage.board.w,stage.board.h).ring.length:0;
  if(!m||m.ended||!Array.isArray(m.players)||m.players.length!==2||!Array.isArray(m.tiles)||m.tiles.length!==expect) return false;
  if(!['normal','hard'].includes(m.difficulty)||!['prep','land','strike'].includes(m.phase)) return false;
  const known=ids=>Array.isArray(ids)&&ids.every(id=>!!CARDS[id]);
  for(const p of m.players){
    if(!p||typeof p.gold!=='number'||!known(p.hand)||!known(p.deck)||!known(p.discard||[])) return false;
  }
  return m.tiles.every(t=>t&&(t.owner==null||!!CARDS[t.cardId]));
}
function keepReward(r){
  if(!r||typeof r!=='object') return null;
  const hotpack=Array.isArray(r.hotpack)?r.hotpack.filter(x=>x&&CARDS[x.id]):[];
  const pulled=Array.isArray(r.pulled)?r.pulled.filter(x=>x&&CARDS[x.id]):[];
  if(r.loss) return {stageId:r.stageId,loss:true,dust:Number(r.dust)||0,pulled};
  const key=r.key&&CARDS[r.key.id]?r.key:null;
  return {...r,key,pulled,hotpack};
}
function loadForLocal(s){const m=s.match,reward=keepReward(s.lastReward);const v=loadSave(s);if(reward)v.lastReward=reward;if(matchLooksPlayable(m))v.match=m;else if(m)droppedMatch=true;return v;}
try{save=initialRaw?loadForLocal(JSON.parse(initialRaw)):newSave();}catch(e){console.warn('Save read error, original retained:',e);recoveryRaw=initialRaw;save=newSave();}
let page=save.match?'game':'home',difficulty='normal',stageSelected=1,previewStage=1,selectedUnit=null,selectedItem=null,sheet=null,story=null,status=!storageAvailable?'로컬 저장소를 사용할 수 없어 자동 저장이 비활성화되었습니다. JSON 백업을 이용하세요.':droppedMatch?'저장된 대전은 이어갈 수 없어 캠페인 기록만 복구했습니다.':'';
if(!save.match&&save.story&&!save.story.prologue){story={id:'prologue',part:'prologue',page:0,then:null};page='story';}
let preserveScroll=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&'+'amp;','<':'&'+'lt;','>':'&'+'gt;','"':'&'+'quot;',"'":'&'+'#39;'}[c]));}
function persist(){if(recoveryRaw!==null||!storageAvailable)return;try{localStorage.setItem(KEY,JSON.stringify(save));}catch(e){status='자동 저장 실패: 브라우저 용량/권한 확인';}}
function btn(label,act,extra='',cls=''){return `<button class="${cls}" data-action="${act}" ${extra}>${esc(label)}</button>`;}
function badge(s){return `<span class="tag r-${s.toLowerCase()}">${RARITY_NAMES[s]}</span>`;}
function kind(c){return c.kind==='unit'?'유닛':c.kind==='spell'?'주문':'아이템';}
function withTrait(c){const t=c.trait&&TRAITS[c.trait];return t?`${c.desc} 특성 ${t.name}: ${t.text}`:c.desc;}
const STAGE_FACE={1:'leo',2:'mira',3:'ar',4:'noel',5:'lin',6:'ser'};
function cornerAt(m,index){return m?.corners?.find(c=>c.index===index)||null;}
function cardSrc(id){return `./art/cards/${id}.png`;}
function faceSrc(name){return `./art/chars/${name}.png`;}
function artTag(src, alt, cls){return `<img class="${cls}" src="${src}" alt="${esc(alt)}" draggable="false">`;}
function cardMini(id,controls='',attrs='',chosen=false){const c=CARDS[id];const land=shownLand();const fit=c.kind==='unit'&&land&&!cornerAt(save.match,land.index)&&c.element===land.element&&c.element!=='neutral';
 return `<div class="mini-card el-${c.element}${fit?' fit':''}${chosen?' chosen':''}" ${attrs}>${artTag(cardSrc(id),c.name,'card-art')}<div class="card-title"><span class="el-chip ${c.element}">${ELEMENTS[c.element]}</span>${badge(c.rarity)} <b>${esc(c.name)}</b></div><div class="small">${kind(c)} · ${c.cost}G${c.kind==='unit'?` · 공격 ${c.atk} / 생명 ${c.hp}`:''}${fit?' · <b class="fit-label">이 땅에 맞음</b>':''}</div><div class="card-desc">${esc(withTrait(c))}</div>${controls}</div>`;
}
function shownLand(){const m=save.match;if(!m||m.ended||fx)return null;if(m.phase==='strike')return m.tiles[m.players[1].pos];if(m.phase==='land'&&m.current===0)return m.tiles[m.players[0].pos];return null;}
function sideCard(id,who,support,hidden){const c=id&&CARDS[id];const sup=hidden?'<div class="back-card">장비 ?</div>':`<p class="small">지원 ${esc(support?CARDS[support].name:'없음')}</p>`;
 if(!c) return `<div class="side unknown"><b>${who}</b><p>유닛을 고르세요</p>${sup}</div>`;
 return `<div class="side el-${c.element} who-${who==='나'?'me':'foe'}"><div class="who">${who}</div>${artTag(cardSrc(c.id),c.name,'card-art')}<span class="el-chip ${c.element}">${ELEMENTS[c.element]}</span><b>${esc(c.name)}</b><p class="small">공격 ${c.atk} · 생명 ${c.hp} · 기본</p>${sup}</div>`;
}
function battleSheet(m){const b=m.battleResult;if(!b)return '';
 const atkWho=b.attacker===0?'나':'적', defWho=b.attacker===0?'적':'나';
 const d=verdict(b,b.defender===0);
 const flow=b.success?`<p class="gold-note">통행료 없음. 수비는 반격 전에 쓰러지고 공격 몬스터가 칸을 가져갑니다.</p>`:(b.paid?`<p class="gold-note">${atkWho} → ${defWho} <b>${b.paid}G</b> 통행료. 수비는 살아 있습니다.</p>`:`<p class="gold-note">낼 골드가 없어 통행료 0. 수비는 살아 있습니다.</p>`);
 const spells=(b.spells||[]).map(x=>`<p class="spell-line">${x.who===0?'나':'적'} ${esc(x.name)} · ${esc(x.line)}</p>`).join('');
 return `<div class="sheet-back"><article class="sheet battle-sheet ${d.tone==='win'?'win flash-win':'lose flash-lose'}" data-action="noop"><p class="kicker">전투 결과</p><h1>${d.title}</h1><div class="versus">${sideCard(b.unitId,atkWho,b.atkSupport,false)}${sideCard(b.defenderId,defWho,b.defSupport,false)}</div><p class="clash">${d.line}</p>${bonusBlock(b,b.defender===0)}<p class="small">카드 그림의 공격·생명은 기본값입니다.</p>${spells}${flow}<div class="go">${btn('확인','battle-clear','','primary')}</div></article></div>`;
}
function nav(){return `<header class="topbar"><div><b>✦ 룬 영토</b><span class="sub"> Alpha ${VERSION}</span> ${btn(muted()?'소리 끔':'소리 켬','mute','','quiet')}</div><div class="nav">${btn('캠페인','home','','navbtn')}${btn('덱·도감','collection','','navbtn')}${btn('로그','logs','','navbtn')}${btn('백업','backup','','navbtn')}</div></header>`;}
function home(){const p=save.progress;return `<section class="intro"><h1>영토와 카드의 전술</h1><p>1인용 모바일 웹 프로토타입. <b>영토 선점·자원 투자·침략</b>을 선택하는 1:1 AI 캠페인입니다.</p><div class="pills"><span>🪙 재료 ${save.dust}</span><span>🎟️ 선택권 ${save.tickets}</span><span>🃏 덱 ${save.deck.length}/${DECK_SIZE}</span></div><div class="action-row">${btn('프롤로그','story-open','data-stage="0"','outline')}</div></section>${save.match?`<div class="notice">진행 중인 대전이 있습니다. ${btn('대전 계속','continue')}</div>`:''}
<section class="section"><h2>캠페인</h2><div class="stage-grid">${STAGES.map(st=>{const lock=st.id>p.highestUnlocked,won=p.wins[st.id]||0;const quote=lock?'':`<p class="story-quote">${esc(STORY.stages[st.id].intro.hook)}</p>`;return `<article class="stage"><div class="stage-head"><b>${st.id}. ${esc(st.name)}</b><span>${lock?'🔒':p.cleared.includes(st.id)?'✓ 클리어':'도전 가능'}</span></div><p>${esc(st.focus)} · 상대: ${esc(st.enemy)}</p>${quote}<p class="small">승리 ${won}회 · 목표 ${st.target}점 · 8턴부터 선도달 · ${st.maxRounds}턴 종료 · 일반 보상 팩 ${STAGE_PACKS[st.id]}장 · 선택권은 3승, 다음 5승, 다음 7승, 이후 10승마다 1장. 50승·100승은 2장 · 일일 첫 승리 보상 ×2</p><div class="stage-buttons">${btn('이야기','story-open',`data-stage="${st.id}" ${lock?'disabled':''}`,'outline')}${btn('카드 확인','deckcheck',`data-stage="${st.id}" ${lock?'disabled':''}`,'outline')}${btn('일반 대전','start',`data-stage="${st.id}" data-diff="normal" ${lock||!!save.match?'disabled':''}`)}${btn('어려움','start',`data-stage="${st.id}" data-diff="hard" ${lock||!p.cleared.includes(st.id)||!!save.match?'disabled':''}`,'outline')}</div></article>`;}).join('')}</div></section>${chapterHTML()}${updateHTML()}${achievementHTML()}${rewardHTML()}<section class="section"><h2>알파 0.1 범위</h2><p class="small">현재는 <b>스테이지 ${STAGES.length}개 · 카드 ${CARD_LIST.length}종 · 덱 ${DECK_SIZE}장</b>입니다. 1장은 작은 사각형이고, 뒤 스테이지는 더 크며 가로·세로 모양이 달라집니다.</p></section>`;}
function updateHTML(){return `<section class="section"><h2>업데이트</h2><div class="stage-grid">${UPDATES.map(u=>`<article class="stage"><div class="stage-head"><b>${esc(u.title)}</b><span>${esc(u.date)}</span></div><p class="small">${esc(u.text)}</p></article>`).join('')}</div></section>`;}
function achievementHTML(){const book=save.achievements||{};const losses=save.losses||0;return `<section class="section"><h2>업적</h2><p class="small">누적 패배 ${losses}회. 항복은 세지 않습니다.</p><div class="stage-grid">${ACHIEVEMENTS.map(a=>{const v=book[a.id];const claimed=v==='claimed'||v===true;const ready=v==='ready';return `<article class="stage"><div class="stage-head"><b>${esc(a.name)}</b><span>${claimed?'받음':ready?'보상 대기':'미달성'}</span></div><p class="small">${esc(a.text)}</p>${ready?`<div class="stage-buttons">${btn('보상 받기','claim',`data-id="${a.id}"`,'primary')}</div>`:''}</article>`;}).join('')}</div></section>`;}
function rewardHTML(){const r=save.lastReward;if(!r)return '';
 const line=(list)=> (list||[]).filter(v=>v&&CARDS[v.id]).map((v,i)=>{const c=CARDS[v.id];return `<article class="flip-card" style="animation-delay:${i*160}ms"><div class="flip-inner"><div class="flip-face back"><b>?</b><span>획득</span></div><div class="flip-face front">${artTag(cardSrc(c.id),c.name,'card-art')}${badge(c.rarity)} <b>${esc(c.name)}</b>${v.converted?'<p class="small">↪ 재료</p>':''}</div></div></article>`;}).join('');
 if(r.loss)return `<section class="section rewards"><h2>최근 경기 · 패배</h2><p>스테이지 ${r.stageId} 커먼 2장 · 제작 재료 +${r.dust}</p><div class="reward-grid">${line(r.pulled)}</div></section>`;
 if(r.achievement)return `<section class="section rewards"><h2>업적 보상</h2><p>${esc(ACHIEVEMENTS.find(a=>a.id===r.achievement)?.name||'업적')}${r.hotpack?.length?` · ${esc(r.packLabel||'핫팩')} ${r.hotpack.length}장`:''}${r.dustGain?` · 재료 +${r.dustGain}`:''}</p><div class="reward-grid">${line(r.hotpack)}</div></section>`;
 return `<section class="section rewards"><h2>최근 획득 보상</h2><p>스테이지 ${r.stageId} 카드팩 ${r.packs}개${r.daily?' · 오늘 첫 승리 ×2':''}${r.first?' · 최초 클리어':''}${r.ticket?` · 선택권 +${r.ticket}`:''}</p><p class="small">이 팩은 방금 이긴 스테이지 카드만 나옵니다. 선택권과 제작은 이미 클리어한 스테이지 전체입니다.</p>${r.key?`<p class="key-reward">확정 공략 카드: <b>${esc(CARDS[r.key.id].name)}</b>${r.key.converted?' (보유 상한 → 재료)':''}</p>`:''}<div class="reward-grid">${line(r.pulled)}</div></section>`;
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
      if(t.owner===1&&c.kind==='unit') return ['select-unit','invade',id===selectedUnit];
      if(t.owner===1&&(c.kind==='item'||c.kind==='spell')) return ['select-item','support',id===selectedItem];
    }
  }
  return ['inspect','view',false];
}
function shownPos(m,who){const n=m.tiles.length;if(fx&&fx.who===who) return (fx.from+fx.tick)%n; return m.players[who].pos;}
function dieHTML(){if(!fx) return ''; return `<div class="die ${fx.rolling?'rolling':'landed'}" data-face="${fx.face}" aria-hidden="true"><b class="die-face">${fx.face}</b></div>`;}
function board(m){let cells=[];const n=m.tiles.length;const focus=fx?(fx.from+fx.tick)%n:m.players[m.current].pos;for(let i=0;i<n;i++){const t=m.tiles[i],[r,c]=[t.r,t.c];
  const here=focus===i?' here':'';
  const hop0=fx&&fx.who===0&&!fx.rolling&&shownPos(m,0)===i?' hop':'';
  const hop1=fx&&fx.who===1&&!fx.rolling&&shownPos(m,1)===i?' hop':'';
  const markers=(shownPos(m,0)===i?artTag(faceSrc('player'),'나','pawn me'+(m.current===0?' active':'')+hop0):'')+(shownPos(m,1)===i?artTag(faceSrc(STAGE_FACE[m.stageId]||'leo'),'AI','pawn ai'+(m.current===1?' active':'')+hop1):'');
  const ev=cornerAt(m,i);
  const unit=t.cardId&&CARDS[t.cardId];
  const matched=unit&&unit.element===t.element&&unit.element!=='neutral';
  const struck=m.battleResult&&m.battleResult.tile===i?' struck':'';
  const who=t.owner===0?'나':t.owner===1?'적':'';
  const label=ev?ev.name:(unit?unit.name:ELEMENTS[t.element]);
  cells.push(`<div class="tile el-${t.element}${ev?' event':''}${matched?' matched':''} owner-${t.owner===null?'none':t.owner}${here}${struck}" style="grid-row:${r+1};grid-column:${c+1}" title="${esc(label)}"><div class="tile-top"><span class="el-chip ${ev?'event':t.element}">${ev?'이벤트':ELEMENTS[t.element]}</span>${matched?'<span class="match-flag">생명 +3</span>':''}${unit&&!matched&&unit.element!=='neutral'?`<span class="miss-flag">불일치</span>`:''}${who?`<span class="who">${who}</span>`:`<b>${t.level?'★'.repeat(t.level):''}</b>`}</div><div class="tile-unit">${esc(label)}${who&&t.level?` <i>Lv${t.level}</i>`:''}</div>${here?'<span class="here-flag">현재</span>':''}<div class="tile-pawns">${markers}</div></div>`);}
 return `<div class="board" style="grid-template-columns:repeat(${m.w},minmax(0,1fr));grid-template-rows:repeat(${m.h},minmax(0,1fr))" role="img" aria-label="${n}칸 순환형 영토 보드">${cells.join('')}<div class="board-center" style="grid-column:2/${m.w};grid-row:2/${m.h}">${artTag(faceSrc(m.current?STAGE_FACE[m.stageId]||'leo':'player'), m.current?'상대':'나','center-face')}<div>라운드 <b>${m.round}/${STAGES[m.stageId-1].maxRounds}</b></div><div class="score-me">나 ${goldScore(m,0)}점</div><div class="score-ai">AI ${goldScore(m,1)}점</div><div class="small">목표 ${STAGES[m.stageId-1].target+(m.difficulty==='hard'?180:0)}점</div></div>${dieHTML()}</div>`;
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
  const atk=defending?'적 공격':'내 공격', land=defending?'내 땅 생명':'적 땅 생명', ret=defending?'내 반격':'적 반격', body=defending?'적 생명':'내 생명';
  const killed=v.attack>=v.defenderHP;
  const countered=v.defense!=null&&v.retaliation>=v.defense;
  if(killed){
    const title=defending?'수비 실패':'침략 성공';
    return {title,line:`${atk} ${v.attack} ≥ ${land} ${v.defenderHP}. 반격 전에 쓰러짐. 땅 점령. 통행료 없음.`,tone:defending?'lose':'win'};
  }
  if(countered){
    const title=defending?'수비 성공':'침략 실패';
    return {title,line:`${atk} ${v.attack} < ${land} ${v.defenderHP}. ${ret} ${v.retaliation} ≥ ${body} ${v.defense}. 공격만 쓰러짐. 통행료.`,tone:defending?'win':'lose'};
  }
  const title=defending?'수비 성공':'무승부';
  return {title,line:`${atk} ${v.attack} < ${land} ${v.defenderHP}. 둘 다 살아 있음. 통행료.`,tone:defending?'win':'lose'};
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
  return `<p class="forecast ${d.tone}"><b>${d.title}</b> ${d.line}</p>${bonusBlock(v,m.phase==='strike')}<p class="small">공격이 먼저입니다. 수비 생명이 0이 되면 반격은 없습니다. 지형 일치는 생명만 +3. 상대 장비는 가려져 있습니다.</p>`;
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
 const coach=selectedOk?'이 유닛이면 장비를 빼도 뚫립니다. 상대 장비로 결과가 바뀔 수 있습니다.':winning.length?'고른 유닛으로는 막힙니다. 점 있는 카드로 바꾸세요.':'지금 손패로는 이 땅을 못 뚫습니다. 지나가면 통행료만 냅니다.';
 const me=selectedUnit?selectedUnit:null;
 return `<div class="prompt battle-prompt"><div class="versus">${sideCard(t.cardId,'적',null,true)}${sideCard(me,'나',selectedItem,false)}</div>${forecastHTML(openForecast(m),m)}<p class="small">${coach}</p><div class="go">${go}</div><div class="choices unit-choices">${options||'손패에 침략용 유닛이 없습니다.'}</div><div class="choices">${supportButtons(supports)}</div></div>`;
}
function defenseControls(m){
  const supports=supportChoices(0);
  if(selectedItem&&!supports.includes(selectedItem))selectedItem=null;
  const unit=CARDS[m.strike.unitId];
  const tile=m.tiles[m.players[1].pos];
  return `<div class="prompt battle-prompt"><div class="versus">${sideCard(unit.id,'적',null,true)}${sideCard(tile.cardId,'나',selectedItem,false)}</div>${forecastHTML(openForecast(m),m)}<div class="go">${btn('수비 확정','answer','','primary')}</div><div class="choices">${supportButtons(supports)}</div></div>`;
}
function turnUI(m){const p=m.players[0];if(fx) return `<div class="prompt"><b>${fx.who?'상대':'나'} ${fx.rolling?'주사위를 굴리는 중':'이동 중'} · ${fx.face}</b></div>`;if(m.ended)return `<div class="prompt"><div class="go">${btn('캠페인으로','finish','','primary')}</div><div class="prompt-main"><b>${m.winner===0?'승리':'패배'}</b><p class="small">${esc(m.reason)} · ${goldScore(m,0)} : ${goldScore(m,1)}</p></div></div>`;
 if(m.phase==='strike') return defenseControls(m);
 if(m.current===1)return '<div class="prompt">AI가 판단 중입니다…</div>';
 if(m.phase==='prep'){const spells=p.hand.filter(id=>legalSpell(save,id));const pay=m.salaryNotice?`<span class="salary">월급 +${m.salaryNotice}G</span>`:'';return `<div class="prompt"><div class="go">${btn('주사위 굴리기','roll','','primary')}</div><div class="prompt-main"><b>이동 준비</b>${pay}<p class="small">굴리면 고리를 따라 움직입니다. 빈 칸, 내 칸, 적 칸에 따라 할 일이 달라집니다.</p>${spells.length?`<div class="choices">${spells.map(id=>btn(`${CARDS[id].name} 보기`,'inspect',`data-id="${id}" data-intent="spell"`,'outline')).join('')}</div>`:''}</div></div>`;}
 const t=getLandedTile(save);if(cornerAt(m,t.index)){const ev=cornerAt(m,t.index);return `<div class="prompt"><div class="go">${btn('받기','pass','','primary')}</div><div class="prompt-main"><b>${esc(ev.name)}</b><p class="small">${esc(ev.text)}</p></div></div>`;}
 if(t.owner===null){const opts=unitPool('place');ensureSelected(opts);const c=selectedUnit&&CARDS[selectedUnit];
  const fits=opts.filter(id=>CARDS[id].element===t.element&&CARDS[id].element!=='neutral');
  const go=c?`${btn('배치','place',`data-id="${c.id}"`,'primary')}${opts.length>1?btn('다음 유닛','next-unit','data-pool="place"','outline'):''}${btn('안 둠','pass','','outline')}`:btn('안 둠','pass','','primary');
  const coach=fits.length?`이 땅은 ${ELEMENTS[t.element]}입니다. 점 있는 카드는 이 칸에서 생명 +3입니다.`:`손패에 맞는 속성이 없습니다. 두면 생명 보너스가 없습니다.`;
  return `<div class="prompt"><div class="go">${go}</div><div class="prompt-main"><b><span class="el-chip ${t.element}">${ELEMENTS[t.element]} 땅</span></b><p class="small">${coach}</p>${c?`<p class="small">선택 <b>${esc(c.name)}</b> · ${c.cost}G · <span class="el-chip ${c.element}">${ELEMENTS[c.element]}</span> 공격 ${c.atk} / 생명 ${c.hp}${c.element===t.element&&c.element!=='neutral'?' · 속성 맞음':''}</p>`:'<p class="small">배치할 손패 유닛이 없습니다.</p>'}<div class="choices unit-choices">${opts.map(id=>btn(`${CARDS[id].element===t.element&&CARDS[id].element!=='neutral'?'● ':''}${CARDS[id].name}`,'select-unit',`data-id="${id}"`,id===selectedUnit?'chosen':'')).join('')}</div></div></div>`;}
 if(t.owner===0){const cost=45*t.level;const c=CARDS[t.cardId];const up=t.level<3&&p.gold>=cost;const comfort=p.gold>=cost+50;
  const upBtn=btn(`강화 ${cost}G`,'upgrade',`${up?'':'disabled'}`,comfort?'primary':'outline');
  const skipBtn=btn('넘김','pass','',comfort?'outline':'primary');
  return `<div class="prompt"><div class="go">${comfort?upBtn+skipBtn:skipBtn+upBtn}</div><div class="prompt-main"><b>내 땅 · <span class="el-chip ${c.element}">${ELEMENTS[c.element]}</span> ${esc(c.name)} Lv.${t.level}</b><p class="small">강화하면 생명이 ${c.grow??3} 오릅니다. 비용 ${cost}G. 돈이 빠듯하면 넘기세요.</p></div></div>`;}
 return fightControls(m);
}
function actBanner(){if(!banner)return '';const a=banner;const title={spell:'주문',strike:'공격',blocked:'막힘',retreat:'퇴각'}[a.kind]||'효과';const art=a.id?artTag(cardSrc(a.id),a.name||title,'card-art'):'';return `<div class="act-banner kind-${a.kind} el-${a.element||'neutral'}"><p class="kicker">${title}</p>${art}${a.name?`<b>${esc(a.name)}</b>`:''}<p>${esc(a.line||'')}</p></div>`;}
function showBanner(act){if(!act)return;banner=act;if(bannerTimer)clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>{banner=null;bannerTimer=null;preserveScroll=true;render();},1400);}
let banner=null,bannerTimer=null;
function goalLine(m){const st=STAGES[m.stageId-1];const target=st.target+(m.difficulty==='hard'?180:0);const mine=goldScore(m,0);return `<p class="goal">${m.round}턴 / ${st.maxRounds}턴 · 목표 ${target}점 · 지금 ${mine}점 · 남은 ${Math.max(0,target-mine)}점. 8턴 이후 먼저 도달하면 승리. 끝나면 높은 점수. 점수는 골드 + 땅마다 70 + 카드 가격 + 레벨×85.</p>`;}
function game(){const m=save.match;if(!m)return home();const p=m.players[0];
 if(m.phase==='land'&&m.current===0&&!m.ended){const t=getLandedTile(save);if(t.owner===null)ensureSelected(unitPool('place'));else if(t.owner===1)ensureSelected(unitPool('invade'));}
 const cards=p.hand.map(id=>{const [act,intent,chosen]=handAttrs(id);return cardMini(id,'',`data-action="${act}" data-id="${id}" data-intent="${intent}"`,chosen);}).join('');
 return `<section class="game-area"><div class="game-header"><b>${esc(STAGES[m.stageId-1].name)} · ${m.difficulty==='hard'?'어려움':'일반'}</b><span>나 ${p.gold}G · ${goldScore(m,0)}점</span><span>상대 ${m.players[1].gold}G · ${goldScore(m,1)}점</span>${!m.ended?btn('항복','surrender','','quiet small-button'):''}</div>${goalLine(m)}${m.goldNote?`<p class="gold-note">${esc(m.goldNote)}</p>`:''}${actBanner()}<div class="game-layout"><div class="board-slot">${board(m)}</div><div class="game-side"><div class="dock">${turnUI(m)}</div><div class="hand"><b>손패 ${p.hand.length}</b><div class="hand-row">${cards||'<p>손패 없음</p>'}</div></div><details class="battle-log"><summary>전투 로그</summary><div>${save.log.slice(0,12).map(s=>`<p>${esc(s)}</p>`).join('')}</div></details></div></div></section>${battleSheet(m)}`;}
function deckCheck(){const st=STAGES.find(x=>x.id===previewStage)||STAGES[0];const hook=STORY.stages[st.id].intro.hook;return `<section class="section"><h1>대전 전 카드 확인</h1><div class="boss-row">${artTag(faceSrc(STAGE_FACE[st.id]),st.enemy,'boss-face')}<div><b>${esc(st.name)}</b><p>상대 ${esc(st.enemy)} · ${esc(st.focus)}</p><p class="story-quote">${esc(hook)}</p><p class="small">내 덱의 그림과 능력을 확인한 다음 대전을 시작하세요.</p></div></div>${deckSummary()}<div class="collection-grid">${save.deck.map(id=>cardMini(id, btn('크게 보기','inspect',`data-id="${id}" data-intent="view"`,'small-button outline'))).join('')}</div><div class="action-row">${btn('이 덱으로 일반 대전','start',`data-stage="${st.id}" data-diff="normal" ${save.match?'disabled':''}`,'primary')}${btn('이야기','story-open',`data-stage="${st.id}"`,'outline')}${btn('캠페인으로','home','','outline')}</div></section>`;}
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
  return !!(save.story.done&&save.story.done[id-1]);
}
function chapterHTML(){return '';}
function beginMatch(stageId,diff){startMatch(save,Number(stageId),diff);selectedUnit=null;selectedItem=null;sheet=null;story=null;page='game';sfx('tap');}
function closeStory(finished=true){
  const then=story&&story.then;
  if(finished) markStory();
  story=null;
  if(then&&then.act==='start'){beginMatch(then.stage, then.diff);return;}
  page='home';
}
function storyHTML(){
  const pack=storyPack(); if(!pack) return '';
  const beat=pack.pages[Math.min(story.page, pack.pages.length-1)];
  const last=story.page>=pack.pages.length-1;
  const face=beat.face||pack.face||'player';
  const nextLabel=last?(story.then&&story.then.act==='start'?'이 이야기로 대전':'캠페인으로'):'다음';
  return `<section class="story-screen"><p class="kicker">${esc(pack.kicker||'이야기')}</p><h1>${esc(pack.title)}</h1><article class="story-card">${artTag(faceSrc(face), beat.speaker||'이야기', 'story-face')}<div><b>${esc(beat.speaker||'')}</b><p class="story-line">${esc(beat.text)}</p></div></article><p class="small story-step">${story.page+1} / ${pack.pages.length}</p><div class="go">${btn(nextLabel,'story-next','','primary')}${last?'':btn('건너뛰기','story-skip','','outline')}</div></section>`;
}
function sheetHTML(){if(!sheet||!CARDS[sheet.id])return '';const c=CARDS[sheet.id];let play='';
 if(sheet.intent==='place') play=btn('확인하고 배치','place',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='spell') play=btn('확인하고 주문','spell',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='invade') play=btn('이 유닛으로 확정','invade',`data-id="${c.id}"`,'primary');
 else if(sheet.intent==='support'||sheet.intent==='item') play=btn('이 지원을 고름','select-item',`data-id="${c.id}"`,'primary');
 return `<div class="sheet-back" data-action="sheet-close"><article class="sheet" data-action="noop">${artTag(cardSrc(c.id),c.name,'sheet-art')}<div class="card-title">${badge(c.rarity)} <b>${esc(c.name)}</b></div><p>${ELEMENTS[c.element]} · ${kind(c)} · ${c.cost}G${c.kind==='unit'?` · 공격 ${c.atk} / 생명 ${c.hp} · 강화할 때마다 생명 +${c.grow??3}`:''}</p><p>${esc(withTrait(c))}</p><div class="action-row">${play}${btn('닫기','sheet-close','','outline')}</div></article></div>`;}
function deckSummary(){
  const deck={fire:0,water:0,earth:0,air:0,neutral:0}, own={...deck}, kind={unit:0,spell:0,item:0};
  for(const id of save.deck){const c=CARDS[id]; if(!c) continue; deck[c.element]++; kind[c.kind]++;}
  for(const c of CARD_LIST) own[c.element]+=(save.collection[c.id]||0);
  const chip=(bag,el)=>`<span class="el-chip ${el}">${ELEMENTS[el]} ${bag[el]}</span>`;
  const row=(bag)=>['fire','water','earth','air','neutral'].map(el=>chip(bag,el)).join('');
  return `<div class="deck-sum"><p>덱 ${save.deck.length}/${DECK_SIZE} · 유닛 ${kind.unit} · 주문 ${kind.spell} · 장비 ${kind.item}</p><p class="pills">덱 ${row(deck)}</p><p class="pills">보유 ${row(own)}</p></div>`;
}
function collection(){const counts={};save.deck.forEach(id=>counts[id]=(counts[id]||0)+1);
 const known=CARD_LIST.filter(c=>save.progress.cleared.includes(c.stage)||(save.collection[c.id]||0)>0);
 return `<section class="section"><h1>카드 컬렉션 · 덱 편집</h1>${deckSummary()}<p>제작 재료 ${save.dust} · 카드 선택권 ${save.tickets}장</p><p class="small">선택권은 클리어한 스테이지의 커먼~레어 카드 중에서 선택. 보관 후 사용 가능. 레전더리도 최대 4장까지 수집 가능.</p>${save.match?'<p class="warning">진행 중인 대전에서는 덱 편집이 잠겨 있습니다.</p>':''}<div class="collection-grid">${known.map(c=>{
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
  root.innerHTML=nav()+(status?`<div class="status" role="alert">${esc(status)} ${btn('닫기','dismiss','','quiet')}</div>`:'')+(page==='home'?home():page==='deckcheck'?deckCheck():page==='game'?game():page==='story'?storyHTML():page==='collection'?collection():page==='logs'?logs():backup())+sheetHTML()+(page==='game'?'':`<footer>Rune Territories · Original prototype · ${VERSION}</footer>`);
  if(preserveScroll){
    const apply=()=>{window.scrollTo(0,y);const h=document.querySelector('.hand-row');if(h)h.scrollLeft=hx;const g=document.querySelector('.game-side');if(g)g.scrollTop=sy;};
    apply(); requestAnimationFrame(apply);
  }
  preserveScroll=false;
  cueSalary();
}
function doAction(act,id,el){
  preserveScroll=!['home','collection','logs','backup','finish','surrender','start','reset','recover-reset','continue','recover-export','story-next','story-skip','story-open'].includes(act);
  switch(act){
 case 'recover-export':{const b=new Blob([recoveryRaw],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='rune-territories-recovery.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return;}
 case 'recover-reset':if(confirm('복구 JSON을 내려받아 안전하게 저장했나요? 새 게임을 시작하면 기존 데이터가 바뀝니다.')){recoveryRaw=null;save=newSave();story={id:'prologue',part:'prologue',page:0,then:null};page='story';status='';}break;
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
 case 'start':{const stageId=Number(el.dataset.stage),diff=el.dataset.diff;if(!save.story.intro[stageId]){story={id:stageId,part:'intro',page:0,then:{act:'start',stage:stageId,diff}};page='story';sheet=null;sfx('tap');break;}beginMatch(stageId,diff);break;}
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
 case 'battle-clear':if(save.match)save.match.battleResult=null;break;
 case 'finish':{const won=save.match?.winner===0;const stageId=save.match?.stageId;endMatch(save);sheet=null;if(won&&stageId&&!save.story.outro[stageId]){story={id:stageId,part:'outro',page:0,then:null};page='story';sfx('win');break;}page='home';sfx(won?'win':'lose');break;}
 case 'surrender':if(confirm('항복하면 보상을 받지 못합니다. 대전을 종료할까요?')){surrender(save);page='home';}break;
 case 'deck-plus':editDeck(save,id,1);break;
 case 'deck-minus':editDeck(save,id,-1);break;
 case 'craft':craft(save,id);break;
 case 'ticket':selectTicket(save,id);break;
 case 'claim':claimAchievement(save,id);page='home';break;
 case 'export':{const blob=new Blob([JSON.stringify({...save,match:null,lastReward:null},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='rune-territories-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status='수집·덱·진행 기록을 JSON으로 내보냈습니다.';break;}
 case 'import':document.getElementById('import-file').click();return;
 case 'reset':if(confirm('모든 진행 데이터를 초기화할까요? (복구 불가)')){save=newSave();story={id:'prologue',part:'prologue',page:0,then:null};page='story';status='';}break;
 }render();queueAi();}
const MUTATING=new Set(['spell','roll','place','upgrade','pass','invade','answer','start','finish','surrender','deck-plus','deck-minus','craft','ticket','claim','reset','recover-reset']);
let actLock=0, aiTimer=null, audioReady=false, heardSalary=-1, fx=null, fxTimer=null;
function clearFxTimer(){if(fxTimer){clearTimeout(fxTimer);fxTimer=null;}}
function startTravel(who,from,steps){
  clearFxTimer();
  if(!(steps>=1&&steps<=4)){fx=null;preserveScroll=true;render();return;}
  fx={who,from,steps,tick:0,face:1,rolling:true,until:Date.now()+1600+steps*380};
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
  try{
    if(!fx) return;
    if(fx.tick>=fx.steps){fx=null;preserveScroll=true;render();return;}
    fx.tick++;sfx('step');preserveScroll=true;render();
    fxTimer=setTimeout(hop,320);
  }catch(e){clearFxTimer();fx=null;status=e.message;preserveScroll=true;render();}
}
function cueSalary(){const m=save.match;if(fx||!m||m.ended||m.current!==0||!m.salaryNotice)return;if(heardSalary===m.turns)return;heardSalary=m.turns;sfx('salary');}
function queueAi(){
  if(fx||aiTimer||!save.match||save.match.current!==1||save.match.ended||save.match.phase==='strike'||save.match.battleResult) return;
  aiTimer=setTimeout(()=>{
    aiTimer=null;
    if(fx||!save.match||save.match.current!==1||save.match.ended) return;
    const from=save.match.players[1].pos, rolled=save.match.phase==='prep';
    try{aiTurn(save);status='';if(save.match?.act)showBanner(save.match.act);}catch(e){status=`AI 오류: ${e.message}`;preserveScroll=true;render();return;}
    const steps=rolled?(save.match.players[1].pos-from+save.match.tiles.length)%save.match.tiles.length:0;
    if(steps>=1&&steps<=4) startTravel(1,from,steps);
    else {preserveScroll=true;render();}
  },90);
}
root.addEventListener('click',e=>{const first=!audioReady;unlockAudio();audioReady=true;if(first){heardSalary=-1;cueSalary();}const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const act=el.dataset.action;if(fx&&fx.until&&Date.now()>fx.until){clearFxTimer();fx=null;}if(fx&&act!=='mute')return;if(MUTATING.has(act)&&Date.now()<actLock)return;if(MUTATING.has(act))actLock=Date.now()+320;try{status='';doAction(act,el.dataset.id,el);}catch(err){status=err.message;render();}});
root.addEventListener('change',async e=>{if(e.target.id!=='import-file')return;const file=e.target.files?.[0];if(!file)return;
 try{const next=loadSave(await file.text());validateDeck(next);save=next;page='home';status='백업에서 진행 기록을 복구했습니다.';}catch(err){status=`복원 취소: ${err.message}`;}render();});
render();
queueAi();
