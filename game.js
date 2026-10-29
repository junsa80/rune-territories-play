import {VERSION, CARDS, CARD_LIST, STAGES, TRIO_STAGE, TRIALS, DECK_SIZE, COPY_LIMIT, STARTER_DECK, RARITIES, RARITY_WEIGHTS, DUST_GAIN, DUST_COST, DAILY_PACKS, STAGE_PACKS, HOT_PACK, ACHIEVEMENTS, STORY, makeBoard, trialReward} from './data.js?v=0.2.0';

export function newSave(seed = Date.now()) {
  const collection = {};
  STARTER_DECK.forEach(id => collection[id] = (collection[id]||0)+1);
  return {version:VERSION, seed:seed>>>0, collection, deckSize:DECK_SIZE, deckSlots:[], deck:[...STARTER_DECK], dust:0, tickets:0,
    progress:{highestUnlocked:1,cleared:[],wins:{},lastDailyWin:{}},match:null,lastReward:null,
    story:{prologue:false, intro:{}, outro:{}, done:{}},
    achievements:{},
    losses:0,
    log:['프로젝트 알파 0.1 — 캠페인 1 스테이지 개방.']};
}
function ensure(ok, message) { if (!ok) throw new Error(message); }
export function rand(s) { s.seed = (Math.imul(s.seed,1664525)+1013904223)>>>0; return s.seed/4294967296; }
export function randInt(s,min,max) { return min + Math.floor(rand(s)*(max-min+1)); }
export function shuffle(s, arr) {
  arr=[...arr]; for(let i=arr.length-1;i>0;i--) { const j=randInt(s,0,i); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr;
}
export function log(s, msg) {s.log.unshift(msg);s.log.length=Math.min(s.log.length,100);}
function noteGold(m,text){if(m) m.goldNote=text;}
function whoName(id){return id===0?'나':id===2?'적2':'적';}
/** Opponent for one-target effects. 1:1 keeps 1-who; 3p picks the richest other side (lowest id on tie). */
function foeOf(m,who){if(m.players.length===2)return 1-who;let best=-1,score=-Infinity;for(const p of m.players){if(p.id===who)continue;const v=goldScore(m,p.id);if(v>score){score=v;best=p.id;}}return best;}
/** Highest total assets; ties go to the lower id (1:1: a>=b?0:1). */
function leaderOf(m){let best=0;for(const p of m.players)if(goldScore(m,p.id)>goldScore(m,best))best=p.id;return best;}
export function currentStage(s) {return stageById(s.match?.stageId);}
export function stageById(id){return STAGES.find(x=>x.id===id)||TRIALS.find(x=>x.id===id);}
export function validateDeck(s) {
  ensure(s.deck.length===DECK_SIZE,`덱은 ${DECK_SIZE}장이어야 합니다.`);
  const used={}; for(const id of s.deck) {ensure(!!CARDS[id],`알 수 없는 카드: ${id}`);used[id]=(used[id]||0)+1;ensure(used[id]<=COPY_LIMIT, '동일 카드 4장 제한');ensure(used[id]<=(s.collection[id]||0),'소유 수량 초과');}
  ensure(s.deck.some(id=>CARDS[id].kind==='unit'),'유닛을 하나 이상 넣어야 합니다.');
  return true;
}
export function editDeck(s,id,delta) {
  ensure(!s.match,'경기 중 덱을 변경할 수 없습니다.');ensure(!!CARDS[id],'알 수 없는 카드');
  const count=s.deck.filter(x=>x===id).length;
  if(delta>0){ensure(s.deck.length<DECK_SIZE,'덱이 가득 찼습니다.');ensure(count<(s.collection[id]||0),'카드 보유 수량 초과');ensure(count<COPY_LIMIT,'같은 카드 최대 4장');s.deck.push(id);}
  else {ensure(count>0,'덱에 없는 카드');s.deck.splice(s.deck.indexOf(id),1);}
}
export function storeDeck(s,index,name){
 ensure(!s.match,'대전 중에는 덱을 보관할 수 없습니다.');validateDeck(s);
 ensure(Number.isInteger(index)&&index>=0&&index<8,'덱 슬롯 오류');
 const title=String(name||'').trim().slice(0,24);ensure(title.length>0,'덱 이름을 입력하세요.');
 if(!Array.isArray(s.deckSlots))s.deckSlots=[];
 s.deckSlots[index]={name:title,deck:[...s.deck]};
}
export function restoreDeck(s,index){
 ensure(!s.match,'대전 중에는 덱을 교체할 수 없습니다.');
 const slot=Number.isInteger(index)&&index>=0&&index<8?s.deckSlots?.[index]:null;ensure(slot&&Array.isArray(slot.deck),'빈 덱 슬롯입니다.');
 validateDeck({...s,deck:slot.deck});s.deck=[...slot.deck];
}
function draw(s,p) {
  if(!p.deck.length && p.discard.length) {p.deck=shuffle(s,p.discard);p.discard=[];}
  if(p.deck.length) p.hand.push(p.deck.pop());
}
function refill(s,p) {while(p.hand.length<4 && (p.deck.length || p.discard.length))draw(s,p);}
function removeHand(p,id) {const i=p.hand.indexOf(id);ensure(i>=0,'손패에 없는 카드');p.hand.splice(i,1);p.discard.push(id);}
function takeHand(p,id) {const i=p.hand.indexOf(id);ensure(i>=0,'손패에 없는 카드');p.hand.splice(i,1);}
// Older games recycled deployed cards into the deck. Preserve those existing
// territories as legacy tokens, without creating a second card on their death.
export function migrateCombat(m){
 if(!m||!Array.isArray(m.tiles))return m;
 const legacy=!m.combatVersion;
 ensure(!m.combatVersion||m.combatVersion===2,'지원하지 않는 전투 저장 버전');
 for(const t of m.tiles){
  if(legacy&&t.owner!==null)t.legacyToken=true;
  if(t.damage===undefined)t.damage=0;
  ensure(Number.isSafeInteger(t.damage)&&t.damage>=0&&t.damage<=1000000,'영토 피해 저장 오류');
 }
 m.combatVersion=2;return m;
}
export function startMatch(s,stageId,difficulty='normal') {
  ensure(!s.match,'진행 중인 대전이 있습니다.');validateDeck(s);
  const stage=stageById(stageId);ensure(!!stage,'없는 스테이지');
  const trio=!!stage.trial;
  if(trio) ensure(trialOpen(s,stage)&&difficulty==='normal',`${stage.name}은 아직 열리지 않았습니다.`);
  else ensure(stageId<=s.progress.highestUnlocked,'아직 개방되지 않은 스테이지');
  ensure(['normal','hard'].includes(difficulty),'지원하지 않는 난이도');
  ensure(trio||difficulty!=='hard'||s.progress.cleared.includes(stageId),'어려움 난이도는 해당 스테이지 최초 클리어 후 개방됩니다.');
  const mkPlayer=(id,deck,pos,bonus=0)=>({id,pos,gold:220+bonus,deck:shuffle(s,deck),hand:[],discard:[],spellUsed:false,placeCut:0});
  const board=makeBoard(stage.board.w,stage.board.h);
  const aiBonus=difficulty==='hard'?80:0;
  s.match={combatVersion:2,stageId,difficulty,round:1,phase:'prep',current:0,steps:0,turns:0,ended:false,w:board.w,h:board.h,corners:board.corners,
    players:trio?[mkPlayer(0,s.deck,0),...stage.enemyDecks.map((d,i)=>mkPlayer(i+1,d,Math.round(board.ring.length*(i+1)/stage.players)))]:[mkPlayer(0,s.deck,0),mkPlayer(1,difficulty==='hard'&&stage.hardEnemyDeck?stage.hardEnemyDeck:stage.enemyDeck,board.aiStart,aiBonus)],
    tiles:board.ring.map(([r,c],i)=>({index:i,r,c,element:board.elements[i],owner:null,cardId:null,level:0,damage:0}))};
  for(const p of s.match.players)refill(s,p);
  log(s,`[대전] ${stage.name} · ${difficulty==='hard'?'어려움':'일반'} 시작`);
  const hook=trio?stage.hook:STORY.stages[stageId]?.intro?.hook;
  if(hook) log(s,`[${stage.enemy}] ${hook}`);
  grantSalary(s);
}
export function goldScore(m,id) {const p=m.players[id];return p.gold+m.tiles.filter(t=>t.owner===id).reduce((acc,t)=>acc+(70+CARDS[t.cardId].cost+t.level*85),0);}
export function ownerLands(m,id) {return m.tiles.filter(t=>t.owner===id);}
export function getLandedTile(s){ensure(!!s.match,'진행 중 대전 없음');return s.match.tiles[s.match.players[s.match.current].pos];}
export function legalSpell(s,id){const m=s.match;const p=m?.players[m.current];return !!(m&&m.phase==='prep'&&p.hand.includes(id)&&CARDS[id]?.kind==='spell'&&!p.spellUsed&&p.gold>=CARDS[id].cost);}
function itemMods(item, attacker, tile){
  if(!item) return {atk:0,def:0};
  if(item.bonus==='def') return {atk:0, def:item.power};
  if(item.bonus==='elem-atk') return {atk:attacker.element!=='neutral'&&attacker.element===tile.element?item.power:1, def:0};
  return {atk:item.power||0, def:0};
}
function defendItemMods(item,defender,tile){
  if(!item) return {hp:0,ret:0};
  if(item.bonus==='def') return {hp:item.power,ret:0};
  if(item.bonus==='elem-atk') return {hp:0,ret:defender.element!=='neutral'&&defender.element===tile.element?item.power:1};
  return {hp:0,ret:item.power||0};
}
function applySpellEffect(s,who,c){const m=s.match,p=m.players[who];
 let line='';
 if(c.effect==='gainGold'){p.gold+=c.power;line=`${whoName(who)} +${c.power}G`;}
 if(c.effect==='drain'){const fid=foeOf(m,who),foe=m.players[fid];const lost=Math.min(c.power,foe.gold);foe.gold-=lost;line=`${whoName(fid)} -${lost}G 소멸`;noteGold(m,`${whoName(fid)} → 소멸 ${lost}G`);}
 if(c.effect==='wage'){const lands=ownerLands(m,who).length;const gain=lands>=3?c.power:c.power2;p.gold+=gain;line=`${whoName(who)} +${gain}G`;}
 if(c.effect==='levelPay'){const levels=ownerLands(m,who).reduce((a,t)=>a+t.level,0);const gain=levels*c.power;p.gold+=gain;line=`${whoName(who)} +${gain}G`;}
 if(c.effect==='placeCut'){p.placeCut=(p.placeCut||0)+c.power;line=`다음 배치 -${c.power}G`;}
 p.spellUsed=true;
 return line;
}
export function playSpell(s,id){ensure(legalSpell(s,id),'이 시점에 사용할 수 없는 주문');const m=s.match,p=m.players[m.current],c=CARDS[id];p.gold-=c.cost;
 const line=applySpellEffect(s,m.current,c);removeHand(p,id);
 m.act={kind:'spell',id:c.id,name:c.name,element:c.element,who:m.current,line};
 log(s,`[${m.current?'AI':'나'}] ${c.name} 사용 · ${line}`);
}
export function roll(s){const m=s.match;ensure(m&&m.phase==='prep','굴릴 수 없는 상태');migrateCombat(m);const p=m.players[m.current];const steps=randInt(s,1,4);m.steps=steps;m.salaryNotice=0;let lap=0;
 m.lastHealing=[];
 for(let i=0;i<steps;i++){p.pos=(p.pos+1)%m.tiles.length;if(p.pos===0){p.gold+=65;lap+=65;m.lastHealing.push(...healLands(m,m.current));}}
 if(m.lastHealing.length)log(s,`[회복] ${whoName(m.current)} 출발점 통과 · ${m.lastHealing.map(x=>`${x.tile}번 +${x.healed}HP`).join(', ')}`);
 if(lap) noteGold(m,`고리 → ${whoName(m.current)} ${lap}G`);
 m.phase='land';const t=m.tiles[p.pos];log(s,`[${m.current?'AI':'나'}] 주사위 ${steps}, ${p.pos}번 칸 (${t.element})`);return steps;
}
export function placementOptions(s,who=s.match?.current){const m=s.match,p=m.players[who],t=m.tiles[p.pos];
 if(m.phase!=='land'||cornerAt(m,t.index)||t.owner!==null)return [];
 return p.hand.filter(id=>{const c=CARDS[id];return c.kind==='unit'&&c.cost-Math.min(c.cost,p.placeCut||0)<=p.gold;});
}
export function tileBonus(t,c){if(!c||c.element==='neutral'||t.element!==c.element)return 0;return Math.max(1,t.level||1);}
function sides(m,t){const n=m.tiles.length;return [m.tiles[(t.index+n-1)%n], m.tiles[(t.index+1)%n]];}
function cornerAt(m,index){return m.corners?.find(c=>c.index===index)||null;}
export function neighborBonus(m,t,owner) {return sides(m,t).filter(x=>x.owner===owner&&x.element===t.element&&t.element!=='neutral').length*2;}
export function defendMods(m,t,level=t.level){
  const c=t.cardId&&CARDS[t.cardId];
  const z={hp:0,ret:0,toll:0};
  if(!c?.trait) return z;
  const mates=sides(m,t).filter(x=>x.owner===t.owner&&x.cardId).length;
  const elMates=sides(m,t).filter(x=>x.owner===t.owner&&x.element===t.element&&t.element!=='neutral').length;
  switch(c.trait){
    case 'root-bind': return {hp:elMates*level, ret:0, toll:0};
    case 'cloud-step': return t.element==='air'?{hp:0,ret:level,toll:0}:z;
    case 'gate-crack': return {hp:level, ret:0, toll:0};
    case 'rain-veil': return t.element==='water'?{hp:2*level, ret:0, toll:0}:z;
    case 'twin-oath': return {hp:mates*level, ret:mates, toll:0};
    case 'double-vow': return {hp:2*level, ret:0, toll:0};
    case 'forest-wall': return {hp:2*level, ret:0, toll:elMates?12*level:0};
    case 'storm-call': return t.element==='air'?{hp:0, ret:2*level, toll:0}:z;
    case 'magma': return t.element==='fire'?{hp:level, ret:2*level, toll:0}:z;
    case 'star-scale': return t.element==='fire'?{hp:2*level, ret:2*level, toll:0}:{hp:level, ret:0, toll:0};
    case 'tide-read': return {hp:(t.element==='water'?2:1)*level, ret:0, toll:t.element==='water'?8*level:0};
    case 'world-root': return {hp:level, ret:0, toll:4*level};
    case 'bastion-hold': return {hp:level, ret:0, toll:0};
    case 'slow-invest': return {hp:level, ret:0, toll:2*level};
    default: return z;
  }
}
function attackMods(c,t){
  const z={atk:0,def:0,stay:1};
  if(!c?.trait) return z;
  switch(c.trait){
    case 'cloud-step': return t.element==='air'?{atk:1,def:0,stay:1}:z;
    case 'gate-crack': return {atk:3,def:0,stay:1};
    case 'rain-veil': return {atk:0,def:2,stay:1};
    case 'double-vow': return {atk:2,def:2,stay:1};
    case 'forest-wall': return {atk:0,def:2,stay:1};
    case 'storm-call': return t.element==='air'?{atk:3,def:0,stay:2}:{atk:0,def:0,stay:1};
    case 'magma': return t.element==='fire'?{atk:3,def:0,stay:1}:z;
    case 'star-scale': return {atk:4,def:1,stay:1};
    case 'tide-read': return {atk:0,def:t.element==='water'?3:1,stay:1};
    case 'world-root': return {atk:0,def:3,stay:1};
    default: return z;
  }
}
function auraHP(m,t){
  let n=0;
  for(const s of sides(m,t)){
    if(s.owner!==t.owner||!s.cardId) continue;
    if(CARDS[s.cardId].trait==='tide-read' && t.element==='water' && s.element==='water') n+=s.level;
  }
  return n;
}
export function tollOf(m,t,level=t.level){
  let toll=level*35+20+defendMods(m,t,level).toll;
  for(const n of sides(m,t)) if(n.owner===t.owner && n.cardId && CARDS[n.cardId].trait==='world-root') toll+=8*n.level;
  return toll;
}
export function traitNumbers(m,t,level=t.level){
  const d=defendMods(m,t,level);
  return {hp:d.hp+auraHP(m,t), ret:d.ret, toll:tollOf(m,t,level)};
}
export function territoryHealth(m,t){
 const c=CARDS[t.cardId];if(!c)return {max:0,current:0,damage:0};
 const max=c.hp+tileBonus(t,c)+neighborBonus(m,t,t.owner)+traitNumbers(m,t).hp;
 const damage=Math.min(t.damage||0,Math.max(0,max-1));
 // Removing a neighboring aura never kills a unit outside combat.
 return {max,current:Math.max(1,max-damage),damage};
}
export function healLands(m,owner){
 const healed=[];
 for(const t of ownerLands(m,owner)){
  const before=territoryHealth(m,t),amount=Math.min(before.damage,Math.ceil(CARDS[t.cardId].hp*.2));
  if(amount){t.damage=before.damage-amount;healed.push({tile:t.index,healed:amount,remaining:territoryHealth(m,t).current});}
 }
 return healed;
}
// Single sequential verdict, shared by previews and actual resolution. Temporary
// equipment HP absorbs damage first; only damage through it persists on land.
export function battleOutcome({attack,defenderHP,defense,retaliation,temporaryHP=0,standingHP=defenderHP-temporaryHP}){
 const attackDamage=Math.min(Math.max(0,attack),defenderHP);
 const success=attackDamage>=defenderHP;
 const counterDamage=success?0:Math.min(Math.max(0,retaliation),defense);
 const attackerRemaining=Math.max(0,defense-counterDamage);
 const persistentDamage=Math.max(0,attackDamage-temporaryHP);
 const defenderRemaining=success?0:Math.max(1,standingHP-persistentDamage);
 const attackerSurvives=attackerRemaining>0;
 return {success,attackDamage,counterDamage,attackerRemaining,attackerSurvives,defenderRemaining,persistentDamage,
  outcome:success?'capture':attackerSurvives?'held':'attacker-dead',cardDestination:success?'territory':attackerSurvives?'hand':'discard'};
}
export function combatPreview(s,attackerId,itemId=null,defItemId=null){const m=s.match,p=m.players[m.current],t=m.tiles[p.pos];
 ensure((m.phase==='land'||m.phase==='strike')&&t.owner!==null&&t.owner!==m.current,'침략할 적 영토가 아닙니다.');
 const a=CARDS[attackerId],d=CARDS[t.cardId],item=itemId?CARDS[itemId]:null,defItem=defItemId?CARDS[defItemId]:null;
 ensure(a?.kind==='unit'&&p.hand.includes(attackerId),'공격 유닛 손패 없음');
 if(item){ensure(item.kind==='item'&&p.hand.includes(itemId),'아이템 손패 없음');}
 if(defItem){ensure(defItem.kind==='item'&&m.players[t.owner].hand.includes(defItemId),'수비 아이템 없음');}
 const am=attackMods(a,t), dm=defendMods(m,t), im=itemMods(item,a,t), dim=defendItemMods(defItem,d,t);
 const tileHp=tileBonus(t,d);
 const neigh=neighborBonus(m,t,t.owner), aura=auraHP(m,t);
 const attack=a.atk+am.atk+im.atk;
 const health=territoryHealth(m,t),standingHP=health.current;
 const defenderHP=standingHP+dim.hp;
 const defense=a.hp+am.def+im.def;
 const retaliation=d.atk+dm.ret+dim.ret;
 const result=battleOutcome({attack,defenderHP,defense,retaliation,temporaryHP:dim.hp,standingHP});
 const parts={
  atk:[['기본',a.atk],['특성',am.atk],['장비',im.atk]],
  hp:[['기본',d.hp],['지형',tileHp],['연속',neigh],['특성',dm.hp],['이웃',aura],['누적 피해',standingHP-health.max],['임시 장비',dim.hp]],
  body:[['기본',a.hp],['특성',am.def],['장비',im.def]],
  ret:[['기본',d.atk],['특성',dm.ret],['장비',dim.ret]]
 };
 return {attack,defenderHP,standingHP,temporaryHP:dim.hp,defense,retaliation,...result,cost:a.cost+(item?.cost||0),toll:tollOf(m,t),stay:am.stay,parts,previousDamage:health.damage};
}
export function place(s,id){const m=s.match;migrateCombat(m);ensure(placementOptions(s).includes(id),'배치 불가능');const p=m.players[m.current],t=m.tiles[p.pos],c=CARDS[id];const cut=Math.min(c.cost,p.placeCut||0);p.gold-=c.cost-cut;p.placeCut=0;takeHand(p,id);
 Object.assign(t,{owner:m.current,cardId:id,level:1,damage:0,legacyToken:false});
 if(m.current===0&&c.element===t.element&&c.element!=='neutral') grantAchievement(s,'first-match');
 log(s,`[${m.current?'AI':'나'}] ${c.name} 배치 (${c.element})`);completeTurn(s);
}
export function upgrade(s){const m=s.match;ensure(m&&m.phase==='land','진행 상태 오류');const p=m.players[m.current],t=m.tiles[p.pos];const cost=45*t.level;
 ensure(t.owner===m.current&&t.level<3&&p.gold>=cost,'강화 불가능');p.gold-=cost;t.level++;
 if(m.current===0) grantAchievement(s,'first-upgrade');
 log(s,`[${m.current?'AI':'나'}] 영토 ${t.index} 강화 → Lv.${t.level} (-${cost}G)`);completeTurn(s);
}
export function invade(s,cardId,itemId=null){return resolveStrike(s,cardId,itemId,null);}
export function playCorner(s){const m=s.match;ensure(m&&m.phase==='land','이벤트 칸이 아닙니다.');const p=m.players[m.current],t=m.tiles[p.pos],ev=cornerAt(m,t.index);
 ensure(!!ev,'이벤트 칸이 아닙니다.');
 const who=m.current?'AI':'나';
 if(ev.id==='pay'){p.gold+=40;noteGold(m,`급여성소 → ${who} 40G`);log(s,`[${who}] ${ev.name} +40G`);}
 else if(ev.id==='altar'){const n=m.tiles.filter(x=>x.owner===m.current&&x.cardId&&x.element==='fire').length;const gain=n?n*16:24;p.gold+=gain;noteGold(m,`화염 제단 → ${who} ${gain}G`);log(s,`[${who}] ${ev.name} +${gain}G`);}
 else if(ev.id==='levy'){const fid=foeOf(m,m.current);const paid=Math.min(22,p.gold);p.gold-=paid;m.players[fid].gold+=paid;noteGold(m,`${who} → ${whoName(fid)} ${paid}G`);log(s,`[${who}] ${ev.name} ${paid}G`);}
 else {p.placeCut=(p.placeCut||0)+20;log(s,`[${who}] ${ev.name} 다음 배치 -20G`);}
 completeTurn(s);
}
export function pass(s){const m=s.match;ensure(m&&m.phase==='land','행동 종료 불가');const t=getLandedTile(s);
 m.act=null;
 if(cornerAt(m,t.index)) return playCorner(s);
 const p=m.players[m.current];
 if(t.owner!==null&&t.owner!==m.current){const toll=tollOf(m,t);const paid=Math.min(toll,p.gold);p.gold-=paid;m.players[t.owner].gold+=paid;noteGold(m,`${whoName(m.current)} → ${whoName(t.owner)} ${paid}G · 퇴각`);m.act={kind:'retreat',who:m.current,element:t.element,line:`${whoName(m.current)} → ${whoName(t.owner)} ${paid}G`};log(s,`[${m.current?'AI':'나'}] 퇴각 · 통행료 ${paid}G`);}
 else log(s,`[${m.current?'AI':'나'}] 영토 행동 생략`);
 completeTurn(s);
}
function salaryOf(m,who){return who===1&&m.difficulty==='hard'?38:32;}
function grantSalary(s){const m=s.match;if(!m||m.ended)return;const pay=salaryOf(m,m.current);m.players[m.current].gold+=pay;m.salaryNotice=pay;log(s,`[월급] ${m.current?'AI':'나'} 턴 시작 +${pay}G`);}
function completeTurn(s){const m=s.match,p=m.players[m.current];refill(s,p);p.spellUsed=false;m.turns++;
 // Never end a match before a few real decisions. Otherwise award to score leader on turn cap.
 const target=currentStage(s).target+(m.difficulty==='hard'?180:0);
 if(m.round>=8 && goldScore(m,m.current)>=target){finish(s,m.current,'목표 자산 도달');return;}
 const last=m.players.length-1;
 if(m.current===last){if(m.round>=currentStage(s).maxRounds){finish(s,leaderOf(m),'턴 제한');return;}m.round++;}
 m.current=(m.current+1)%m.players.length;m.phase='prep';grantSalary(s);
}
export function availableItem(s){const m=s.match,p=m.players[m.current];return p.hand.filter(id=>CARDS[id].kind==='item');}
function discountValue(p,c){const unitCost=Math.max(0,...p.hand.filter(id=>CARDS[id]?.kind==='unit').map(id=>CARDS[id].cost));return Math.min(c.power,Math.max(0,unitCost-(p.placeCut||0)))-c.cost;}
function bestSpell(s){
  const m=s.match,p=m.players[m.current],foe=m.players[foeOf(m,m.current)];
  let best=null,bestScore=24;
  for(const id of p.hand.filter(x=>legalSpell(s,x))){
    const c=CARDS[id];
    let score=-999;
    if(c.effect==='gainGold') score=c.power-c.cost;
    else if(c.effect==='drain') score=Math.min(c.power,foe.gold)-c.cost-(p.gold<70?40:0);
    else if(c.effect==='wage'){const lands=ownerLands(m,p.id).length;score=(lands>=3?c.power:c.power2)-c.cost;}
    else if(c.effect==='levelPay'){const levels=ownerLands(m,p.id).reduce((a,t)=>a+t.level,0);score=levels*c.power-c.cost;}
    else if(c.effect==='placeCut') score=discountValue(p,c);
    if(score>bestScore){bestScore=score;best=id;}
  }
  return best;
}
function sideSpell(s,who){
  const m=s.match,p=m.players[who],foe=m.players[foeOf(m,who)];
  if(p.spellUsed) return null;
  let best=null,bestScore=24;
  for(const id of p.hand){
    const c=CARDS[id];
    if(c.kind!=='spell'||p.gold<c.cost) continue;
    let score=-999;
    if(c.effect==='gainGold') score=c.power-c.cost;
    else if(c.effect==='drain') score=Math.min(c.power,foe.gold)-c.cost-(p.gold<70?40:0);
    else if(c.effect==='wage'){const lands=ownerLands(m,who).length;score=(lands>=3?c.power:c.power2)-c.cost;}
    else if(c.effect==='levelPay'){const levels=ownerLands(m,who).reduce((a,t)=>a+t.level,0);score=levels*c.power-c.cost;}
    else if(c.effect==='placeCut') score=discountValue(p,c);
    if(score>bestScore){bestScore=score;best=id;}
  }
  return best;
}
/** Defender pick. Sees the attacking unit only, never the attacker's spell or item. */
export function secretDefense(s,unitId){
  const m=s.match,def=m.tiles[m.players[m.current].pos].owner,foe=m.players[def];
  let open;
  try{open=combatPreview(s,unitId,null,null);}catch{return null;}
  const items=foe.hand.filter(id=>CARDS[id].kind==='item'&&foe.gold>=CARDS[id].cost);
  const cheapest=list=>list.slice().sort((a,b)=>CARDS[a].cost-CARDS[b].cost||CARDS[b].power-CARDS[a].power)[0]||null;
  if(open.success){
    const flips=[];
    for(const id of items){try{if(!combatPreview(s,unitId,null,id).success)flips.push(id);}catch{/* skip */}}
    const pick=cheapest(flips);
    if(pick) return pick;
  }
  // Protect permanent HP or stop a returning attacker, but do not spend a
  // costly item on damage which the next lap will heal anyway.
  const tile=m.tiles[m.players[m.current].pos],health=territoryHealth(m,tile);
  const nearLap=(m.tiles.length-foe.pos)/2.5<=2;
  let best=null,bestValue=0;
  for(const id of items){
    const v=combatPreview(s,unitId,null,id);
    const saved=Math.max(0,open.persistentDamage-v.persistentDamage);
    const value=saved*(nearLap?3:8)+(open.attackerSurvives&&!v.attackerSurvives?45:0)+(open.success&&!v.success?70+tile.level*65:0)-CARDS[id].cost;
    if(value>bestValue&&foe.gold-CARDS[id].cost>=(health.current<health.max?12:25)){best=id;bestValue=value;}
  }
  if(best)return best;
  return sideSpell(s,def);
}
export function resolveStrike(s,unitId,atkSupport=null,defSupport=null){
  const m=s.match,atk=m.current,p=m.players[atk],t=m.tiles[p.pos],def=t.owner,foe=m.players[def];
  migrateCombat(m);
  ensure((m.phase==='land'||m.phase==='strike')&&def!==null&&def!==atk,'침략할 적 영토가 아닙니다.');
  const unit=CARDS[unitId];
  ensure(unit?.kind==='unit'&&p.hand.includes(unitId),'공격 유닛 손패 없음');
  const as=atkSupport?CARDS[atkSupport]:null,ds=defSupport?CARDS[defSupport]:null;
  if(as){ensure((as.kind==='item'||as.kind==='spell')&&p.hand.includes(atkSupport),'공격 지원 없음');ensure(!(as.kind==='spell'&&p.spellUsed),'이번 턴 주문을 이미 썼습니다');}
  if(ds){ensure((ds.kind==='item'||ds.kind==='spell')&&foe.hand.includes(defSupport),'수비 지원 없음');ensure(!(ds.kind==='spell'&&foe.spellUsed),'수비 주문을 이미 썼습니다');}
  const atkItem=as?.kind==='item'?atkSupport:null, defItem=ds?.kind==='item'?defSupport:null;
  const v=combatPreview(s,unitId,atkItem,defItem);
  ensure(p.gold>=unit.cost+(as?.cost||0),'공격 비용 부족');
  ensure(foe.gold>=(ds?.cost||0),'수비 비용 부족');
  p.gold-=unit.cost+(as?.cost||0); if(ds) foe.gold-=ds.cost;
  // A surviving attacker stays in its original hand slot. No remove/re-add and
  // no refill exploit; supports are consumed exactly once in every outcome.
  if(v.success)takeHand(p,unitId);else if(!v.attackerSurvives)removeHand(p,unitId);
  if(as) removeHand(p,atkSupport); if(ds) removeHand(foe,defSupport);
  m.strike=null; m.phase='land';
  const who=id=>id?'AI':'나', name=id=>id?CARDS[id].name:'없음';
  const defenderId=t.cardId;
  log(s,`[공개] ${who(atk)} ${unit.name}+${name(atkSupport)} / ${who(def)} ${name(defSupport)}`);
  const spells=[];
  if(as?.kind==='spell') spells.push({who:atk,id:as.id,name:as.name,line:applySpellEffect(s,atk,as)});
  if(ds?.kind==='spell') spells.push({who:def,id:ds.id,name:ds.name,line:applySpellEffect(s,def,ds)});
  let moved=0;
  if(v.success){if(!t.legacyToken)foe.discard.push(defenderId);Object.assign(t,{owner:atk,cardId:unitId,level:v.stay||1,damage:0,legacyToken:false});
    log(s,`[${who(atk)}] 침략 성공 (${v.attack}/${v.defenderHP})`);
  } else {t.damage=v.previousDamage+v.persistentDamage;moved=Math.min(p.gold,v.toll);p.gold-=moved;foe.gold+=moved;
    noteGold(m,`${whoName(atk)} → ${whoName(def)} ${moved}G · 통행료`);
    log(s,`[${who(atk)}] 수비 유지 · 피해 ${v.attackDamage}, 수비 잔여 ${v.defenderRemaining}HP · 반격 ${v.counterDamage} · ${v.attackerSurvives?'공격 카드 손패 복귀':'공격자 사망·버림패'} · 통행료 ${moved}G`);
  }
  m.act={kind:v.success?'strike':'blocked',id:unit.id,name:unit.name,element:unit.element,who:atk,line:spells.map(x=>`${whoName(x.who)} ${x.name} · ${x.line}`).join(' / ')};
  m.battleResult={...v,cost:unit.cost+(as?.cost||0),attacker:atk,defender:def,unitId,atkSupport:atkSupport||null,defSupport:defSupport||null,defenderId,element:t.element,tile:t.index,paid:moved,spells};
  completeTurn(s);return v.success;
}
export function declareStrike(s,unitId,supportId=null){
  ensure(s.match?.phase==='land'&&s.match.current===0,'지금 침략할 수 없습니다.');
  return resolveStrike(s,unitId,supportId||null,secretDefense(s,unitId));
}
export function answerStrike(s,supportId=null){
  const m=s.match;ensure(m?.phase==='strike'&&m.strike,'가려진 전투가 없습니다.');
  const {unitId,supportId:atkSup}=m.strike;
  return resolveStrike(s,unitId,atkSup,supportId||null);
}
/** Same rules as the opponent. No dice rigging; only the evaluation differs by stage style.
 *  Safe to call again if a previous turn stopped on the land step (resume, no second roll).
 *  holdStrike: a human defender must answer before the attacker's support is revealed. */
export function autoTurn(s,holdStrike=false){
  const m=s.match;ensure(m&&!m.ended,'진행 중인 대전이 없습니다.');
  if(m.phase==='strike'){if(holdStrike)return;answerStrike(s,secretDefense(s,m.strike.unitId));return;}
  const p=m.players[m.current],stage=currentStage(s);
  if(m.phase==='prep'){const spell=bestSpell(s); if(spell) playSpell(s,spell); roll(s);}
  const t=getLandedTile(s);
  if(cornerAt(m,t.index)){playCorner(s);return;}
  if(t.owner===null){
    const opts=placementOptions(s);
    const ranked=opts.map(id=>{
      const c=CARDS[id];
      const match=tileBonus(t,c);
      const rare={U:6,R:10,E:16,L:22}[c.rarity]||0;
      return {id,score:c.hp*1.1+(c.atk+attackMods(c,t).atk)*1.4+match*8-c.cost*0.08+(c.trait?rare:0)+(match&&c.trait?12:0)+(stage.style==='fortress'?c.hp*0.3:0)+(stage.style==='aggressive'?c.atk*0.4:0)};
    }).sort((a,b)=>b.score-a.score);
    // Stage 1 keeps cash back, so a first game still finds empty tiles.
    const reserve=(stage.id===1&&m.current===1)||(stage.gentle&&m.current!==0)?(stage.gentle||280):stage.style==='aggressive'?8:20;
    const pick=ranked.length?CARDS[ranked[0].id]:null;
    const pay=pick?pick.cost-Math.min(pick.cost,p.placeCut||0):0;
    if(pick&&p.gold>=pay+reserve){place(s,ranked[0].id);return;}
  } else if(t.owner===m.current){
    const cost=45*t.level;
    // Level 1 stays crackable unless the owner is actually rich. Fortress still walls up later.
    const reserve=((stage.id===1&&m.current===1)||(stage.gentle&&m.current!==0)?(stage.gentle?stage.gentle+40:320):stage.style==='fortress'?(t.level===1?120:70):stage.style==='aggressive'?100:80)-(CARDS[t.cardId]?.trait?30:0);
    const health=territoryHealth(m,t),threat=m.players.some(x=>x.id!==m.current&&(t.index-x.pos+m.tiles.length)%m.tiles.length<=4);
    const soonHeal=(m.tiles.length-p.pos)/2.5<=2;
    const defensiveReserve=reserve-(threat&&health.damage?35:0)+(soonHeal&&health.damage&&!threat?25:0);
    if(t.level<3&&p.gold>=cost+defensiveReserve){upgrade(s);return;}
  } else {
    const items=availableItem(s),units=p.hand.filter(id=>CARDS[id].kind==='unit');
    const foe=Math.max(...m.players.filter(x=>x.id!==m.current).map(x=>goldScore(m,x.id)));
    const target=stage.target+(m.difficulty==='hard'?180:0);
    const urgent=foe>target-250||m.round>=stage.maxRounds-3;
    const fights=[];
    for(const id of units){for(const itemId of [null,...items]){
      try{
        const v=combatPreview(s,id,itemId);
        if(v.cost<=p.gold){
          const keep=stage.style==='fortress'?40:18;
          if(!urgent && p.gold-v.cost<keep && t.level<2) continue;
          if(v.success){
            fights.push({id,itemId,score:t.level*55+90-v.cost*.4+(stage.style==='aggressive'?35:0)+(urgent?60:0)+(t.damage?15:0)});
          }else{
            const remaining=stage.maxRounds-m.round,lapTurns=m.tiles.length/2.5;
            // Failed attacks still pay toll. Compare incremental cost against
            // persistent damage likely to remain for a later visit, not raw ATK.
            const residual=Math.max(0,v.persistentDamage-Math.ceil(CARDS[t.cardId].hp*.2));
            const landValue=70+CARDS[t.cardId].cost+t.level*85;
            const followUp=p.hand.some(other=>other!==id&&CARDS[other].kind==='unit'&&CARDS[other].atk>=v.defenderRemaining);
            const benefit=landValue*Math.min(1,residual/v.standingHP)*.65+(followUp?18:0);
            const loss=v.cost+(v.attackerSurvives?0:35)+Math.max(0,v.toll-(p.gold-v.cost))*.2;
            const score=benefit-loss;
            if(remaining>=Math.ceil(lapTurns)&&v.attackerSurvives&&v.attack>=v.defenderRemaining+Math.ceil(CARDS[t.cardId].hp*.2)&&v.persistentDamage>=2&&p.gold>=v.cost+v.toll+keep&&score>12)
              fights.push({id,itemId,score});
          }
        }
      }catch{/* illegal combo */}
    }}
    fights.sort((a,b)=>b.score-a.score);
    if(fights.length){
      const {id,itemId}=fights[0];
      if(holdStrike&&t.owner===0){m.phase='strike';m.strike={unitId:id,supportId:itemId||null};return;}
      resolveStrike(s,id,itemId,secretDefense(s,id));return;
    }
  }
  pass(s);
}
export function aiTurn(s){ensure(s.match&&s.match.current!==0&&!s.match.ended,'AI 턴이 아닙니다.');autoTurn(s,true);}
function rolledRarity(s,min){let x=rand(s),weights=RARITY_WEIGHTS[min];for(let i=0;i<weights.length;i++){x-=weights[i];if(x<0)return RARITIES[i];}return 'L';}
export function acquire(s,id){ensure(!!CARDS[id],'유효하지 않은 카드');const count=s.collection[id]||0;
 if(count>=COPY_LIMIT){s.dust+=DUST_GAIN[CARDS[id].rarity];return {id,converted:true,dust:DUST_GAIN[CARDS[id].rarity]};}
 s.collection[id]=count+1;return {id,converted:false};
}
export function generatePack(s, stageId){const min=['R','U','U','U','C','C','C','C','C','C'];
 const stage=Number(stageId);
 ensure(s.progress.cleared.includes(stage),'클리어하지 않은 스테이지의 카드팩은 열 수 없습니다.');
 const pool=CARD_LIST.filter(c=>c.stage===stage);ensure(pool.length>0,'카드풀이 열리지 않았습니다.');
 return min.map(tier=>{
   const rarity=rolledRarity(s,tier);let candidates=pool.filter(c=>c.rarity===rarity);
   // If a future content tier isn't available, stay at/above the guaranteed tier.
   if(!candidates.length)candidates=pool.filter(c=>RARITIES.indexOf(c.rarity)>=RARITIES.indexOf(tier));
   ensure(candidates.length>0,'보장 등급에 맞는 카드풀이 없습니다.');
   return acquire(s,candidates[randInt(s,0,candidates.length-1)].id);
 });
}
export function awardWin(s,stageId,difficulty,day){
 const prog=s.progress,stage=STAGES.find(x=>x.id===stageId);ensure(!!stage,'스테이지 없음');
 const first=!prog.cleared.includes(stageId);let key=null;
 if(first){prog.cleared.push(stageId);prog.highestUnlocked=Math.max(prog.highestUnlocked,Math.min(STAGES.length,stageId+1));key=acquire(s,stage.keyCard);}
 const wins=(prog.wins[stageId]||0)+1;prog.wins[stageId]=wins;
 const dailyKey=String(stageId);const daily=prog.lastDailyWin[dailyKey]!==day;
 if(daily)prog.lastDailyWin[dailyKey]=day;
 const packCount=DAILY_PACKS[difficulty]*(STAGE_PACKS[stageId]||1)*(daily?2:1),pulled=[];
 for(let i=0;i<packCount;i++)pulled.push(...generatePack(s,stageId));
 const ticket=repeatTicket(wins);if(ticket)s.tickets+=ticket;
 grantAchievement(s,'first-win');
 if(first) grantAchievement(s,`clear-${stageId}`);
 s.lastReward={stageId,first,key,daily,packs:packCount,pulled,ticket,dust:s.dust};
 log(s,`[보상] ${stage.name}: 이 스테이지 카드팩 ${packCount}개${daily?' (오늘 첫 승리 2배)':''}${key?' + 확정 카드':''}${ticket?` + 선택권 ${ticket}`:''}`);
 return s.lastReward;
}
function repeatTicket(wins){
 let at=0,n=0;
 for(const step of [3,5,7]){at+=step;if(wins===at){n=1;break;}if(wins<at)break;}
 if(!n&&wins>at&&(wins-at)%10===0)n=1;
 if(wins===50||wins===100)n+=2;
 return n;
}
function finish(s,winner,reason){const m=s.match;ensure(m&&!m.ended,'이미 종료됨');m.ended=true;m.winner=winner;m.reason=reason;
 const scores=m.players.map(p=>goldScore(m,p.id));log(s,`[종료] ${winner===0?'승리':'패배'} · ${reason} · ${scores.join(' : ')}`);
 const trial=stageById(m.stageId);if(trial?.trial){const k=trial.record;s[k]=s[k]||{played:0,wins:0};s[k].played++;if(winner===0)s[k].wins++;awardTrial(s,trial,winner===0);return;}
 if(winner===0){const now=new Date();const day=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
   awardWin(s,m.stageId,m.difficulty,day);
 } else awardLoss(s,m.stageId);
}
// 시범 전용 보상: TRIAL_REWARD_BASE 비율 × 측정 분. 1:1 보상표·패배 횟수 업적과 분리.
function awardTrial(s,st,won){const rw=trialReward(st.minutes);const ps=s.progress.cleared.includes(st.packStage)?st.packStage:1;
 if(won){const pulled=[];for(let i=0;i<rw.winPacks;i++)pulled.push(...generatePack(s,ps));grantAchievement(s,st.achievement);
  s.lastReward={stageId:st.id,trial:st.name,packs:rw.winPacks,pulled,dust:s.dust};log(s,`[보상] ${st.name} 승리: ${ps}장 카드팩 ${rw.winPacks}개`);return;}
 const pool=CARD_LIST.filter(c=>c.stage===ps&&c.rarity==='C');const pulled=[];for(let i=0;i<rw.lossCommons;i++)pulled.push(acquire(s,pool[randInt(s,0,pool.length-1)].id));
 s.dust+=rw.lossDust;s.lastReward={stageId:st.id,trial:st.name,loss:true,dust:rw.lossDust,pulled};log(s,`[보상] ${st.name} 패배: ${ps}장 커먼 ${rw.lossCommons}장 · 재료 +${rw.lossDust}`);}
function awardLoss(s,stageId){
 const pool=CARD_LIST.filter(c=>c.stage===stageId&&c.rarity==='C');
 const source=pool.length?pool:CARD_LIST.filter(c=>c.stage===stageId);
 const pulled=[];
 for(let i=0;i<2;i++) pulled.push(acquire(s,source[randInt(s,0,source.length-1)].id));
 s.dust+=8;
 s.losses=(s.losses||0)+1;
 grantAchievement(s,'first-loss');
 for(const n of [3,5,10]) if(s.losses>=n) grantAchievement(s,`loss-${n}`);
 s.lastReward={stageId,loss:true,dust:8,pulled,losses:s.losses};
 const names=pulled.map(v=>CARDS[v.id].name+(v.converted?'→재료':'')).join(', ');
 log(s,`[보상] 패배: 그 스테이지 커먼 2장 (${names}) · 재료 +8`);
}
function pullTier(s,stageId,floors){
 const pool=stageId?CARD_LIST.filter(c=>c.stage===stageId):CARD_LIST;
 ensure(pool.length>0,'카드풀이 없습니다.');
 return floors.map(tier=>{
  const rarity=rolledRarity(s,tier);
  let candidates=pool.filter(c=>c.rarity===rarity);
  if(!candidates.length) candidates=pool.filter(c=>RARITIES.indexOf(c.rarity)>=RARITIES.indexOf(tier));
  if(!candidates.length) candidates=pool;
  return acquire(s,candidates[randInt(s,0,candidates.length-1)].id);
 });
}
function grantAchievement(s,id){
 if(!s.achievements||typeof s.achievements!=='object') s.achievements={};
 const cur=s.achievements[id];
 if(cur==='ready'||cur==='claimed'||cur===true) return false;
 s.achievements[id]='ready';
 const name=ACHIEVEMENTS.find(a=>a.id===id)?.name||id;
 log(s,`[업적] ${name} 달성. 캠페인에서 보상을 받으세요.`);
 return true;
}
export function claimAchievement(s,id){
 ensure(!s.match||s.match.ended,'대전 중에는 업적 보상을 받을 수 없습니다.');
 if(!s.achievements||s.achievements[id]!=='ready') ensure(false,'받을 수 있는 업적이 아닙니다.');
 const spec=ACHIEVEMENTS.find(a=>a.id===id);
 ensure(!!spec,'없는 업적');
 s.achievements[id]='claimed';
 if(spec.reward==='hotpack'||spec.reward==='pack'){
  const floors=spec.reward==='hotpack'?HOT_PACK:spec.floors;
  const hotpack=pullTier(s,0,floors);
  const label=spec.reward==='hotpack'?'핫팩':'카드';
  s.lastReward={achievement:id,hotpack,packLabel:label,dust:s.dust};
  log(s,`[업적] ${spec.name} 보상 · ${label} ${hotpack.length}장`);
  return s.lastReward;
 }
 const gain=spec.dust||0;
 s.dust+=gain;
 s.lastReward={achievement:id,dustGain:gain,dust:s.dust,pulled:[]};
 log(s,`[업적] ${spec.name} 보상 · 재료 +${gain}`);
 return s.lastReward;
}
export function endMatch(s){ensure(s.match?.ended,'경기 중에는 나갈 수 없습니다.');s.match=null;}
export function surrender(s){ensure(s.match&&!s.match.ended,'진행 중인 대전이 없습니다.');
 log(s,'[종료] 항복: 보상 없음');s.match=null;s.lastReward=null;
}
export function selectTicket(s,id){const c=CARDS[id];ensure(!!c,'없는 카드');ensure(s.tickets>0,'선택권 부족');ensure(s.progress.cleared.includes(c.stage),'클리어하지 않은 스테이지 카드');
 ensure(['C','U','R'].includes(c.rarity),'일반 선택권은 레어 이하만 선택 가능합니다.');
 ensure((s.collection[id]||0)<COPY_LIMIT,'이미 4장 보유');s.tickets--;acquire(s,id);log(s,`[선택권] ${c.name} 확정 획득`);
}
export function craft(s,id){const c=CARDS[id];ensure(!!c,'없는 카드');ensure(s.progress.cleared.includes(c.stage),'해금되지 않은 카드');ensure((s.collection[id]||0)<COPY_LIMIT,'이미 4장 보유');
 ensure(s.dust>=DUST_COST[c.rarity],'재료 부족');s.dust-=DUST_COST[c.rarity];acquire(s,id);log(s,`[제작] ${c.name} 제작`);
}
export function loadSave(raw){const s=typeof raw==='string'?JSON.parse(raw):raw;
 ensure(s&&typeof s==='object'&&s.version===VERSION,'호환되지 않는 저장 버전. 원본 백업을 유지하세요.');
 ensure(Number.isInteger(s.seed)&&s.seed>=0,'저장 시드 오류');ensure(Array.isArray(s.deck)&&s.collection&&s.progress&&Array.isArray(s.log),'저장 데이터 필수 항목 누락');
 ensure(s.deck.every(id=>!!CARDS[id]),'알 수 없는 카드');ensure(Object.entries(s.collection).every(([id,v])=>!!CARDS[id]&&Number.isInteger(v)&&v>=0&&v<=COPY_LIMIT),'카드 보유 수량 오류');
 ensure(Number.isSafeInteger(s.dust)&&s.dust>=0&&Number.isSafeInteger(s.tickets)&&s.tickets>=0,'재료/선택권 오류');
 if(s.deckSize==null&&s.deck.length===12){
  const need={}; for(const id of STARTER_DECK) need[id]=(need[id]||0)+1;
  for(const [id,n] of Object.entries(need)) s.collection[id]=Math.max(s.collection[id]||0,n);
  s.deck=[...STARTER_DECK];
  s.log.unshift('[이전] 덱 제한이 40장이 되어 시작 덱으로 맞췄습니다. 모아 둔 카드는 남습니다.');
 }
 s.deckSize=DECK_SIZE;
 if(!Array.isArray(s.deckSlots))s.deckSlots=[];
 s.deckSlots=Array.from({length:Math.min(8,s.deckSlots.length)},(_,i)=>{
  const slot=s.deckSlots[i];if(!slot||typeof slot.name!=='string'||!Array.isArray(slot.deck))return null;
  try{validateDeck({...s,deck:slot.deck});return {name:slot.name.slice(0,24),deck:[...slot.deck]};}catch{return null;}
 });
 ensure(s.deck.length<=DECK_SIZE,'저장 덱 장수 오류');
 const used={};
 for(const id of s.deck){used[id]=(used[id]||0)+1;ensure(used[id]<=COPY_LIMIT&&used[id]<=(s.collection[id]||0),'저장 덱 보유 수량 오류');}
 const p=s.progress, stageIds=STAGES.map(st=>st.id);
 ensure(Number.isInteger(p.highestUnlocked)&&stageIds.includes(p.highestUnlocked)&&Array.isArray(p.cleared)&&p.cleared.every(id=>stageIds.includes(id)),'저장 캠페인 진행 오류');
 for(const field of ['wins','lastDailyWin']) ensure(p[field]&&typeof p[field]==='object'&&!Array.isArray(p[field]),'저장 캠페인 기록 오류');
 ensure(Object.values(p.wins).every(n=>Number.isSafeInteger(n)&&n>=0),'저장 승리 횟수 오류');
 ensure(s.log.every(line=>typeof line==='string'),'저장 로그 오류');
 s.log=s.log.slice(0,100);
 s.match=null;s.lastReward=null;
 if(!s.story||typeof s.story!=='object') s.story={prologue:false, intro:{}, outro:{}};
 if(!s.story.intro||typeof s.story.intro!=='object') s.story.intro={};
 if(!s.story.outro||typeof s.story.outro!=='object') s.story.outro={};
 if(!s.story.done||typeof s.story.done!=='object') s.story.done={};
 if(!s.achievements||typeof s.achievements!=='object') s.achievements={};
 if(!Number.isInteger(s.losses)||s.losses<0) s.losses=s.achievements['first-loss']?1:0;
 return s;
}


export function trioOpen(s){return !!s.progress?.cleared?.includes(1);}
export function quadOpen(s){return (s.trio?.played||0)>=1||!!s.progress?.cleared?.includes(2);}
export function trialOpen(s,st){return st.id===TRIO_STAGE.id?trioOpen(s):quadOpen(s);}

