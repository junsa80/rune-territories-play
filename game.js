import {VERSION, CARDS, CARD_LIST, STAGES, RING, TILE_ELEMENTS, DECK_SIZE, COPY_LIMIT, STARTER_DECK, RARITIES, RARITY_WEIGHTS, DUST_GAIN, DUST_COST, DAILY_PACKS, STORY} from './data.js';

export function newSave(seed = Date.now()) {
  const collection = {};
  STARTER_DECK.forEach(id => collection[id] = (collection[id]||0)+1);
  return {version:VERSION, seed:seed>>>0, collection, deck:[...STARTER_DECK], dust:0, tickets:0,
    progress:{highestUnlocked:1,cleared:[],wins:{},lastDailyWin:{}},match:null,lastReward:null,
    story:{prologue:false, intro:{}, outro:{}, done:{}},
    log:['프로젝트 알파 0.1 — 캠페인 1 스테이지 개방.']};
}
function ensure(ok, message) { if (!ok) throw new Error(message); }
export function rand(s) { s.seed = (Math.imul(s.seed,1664525)+1013904223)>>>0; return s.seed/4294967296; }
export function randInt(s,min,max) { return min + Math.floor(rand(s)*(max-min+1)); }
export function shuffle(s, arr) {
  arr=[...arr]; for(let i=arr.length-1;i>0;i--) { const j=randInt(s,0,i); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr;
}
export function log(s, msg) {s.log.unshift(msg);s.log.length=Math.min(s.log.length,100);}
export function currentStage(s) {return STAGES.find(x=>x.id===s.match?.stageId);}
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
function draw(s,p) {
  if(!p.deck.length && p.discard.length) {p.deck=shuffle(s,p.discard);p.discard=[];}
  if(p.deck.length) p.hand.push(p.deck.pop());
}
function refill(s,p) {while(p.hand.length<4 && (p.deck.length || p.discard.length))draw(s,p);}
function removeHand(p,id) {const i=p.hand.indexOf(id);ensure(i>=0,'손패에 없는 카드');p.hand.splice(i,1);p.discard.push(id);}
export function startMatch(s,stageId,difficulty='normal') {
  ensure(!s.match,'진행 중인 대전이 있습니다.');validateDeck(s);
  const stage=STAGES.find(x=>x.id===stageId);ensure(!!stage,'없는 스테이지');
  ensure(stageId<=s.progress.highestUnlocked,'아직 개방되지 않은 스테이지');
  ensure(['normal','hard'].includes(difficulty),'지원하지 않는 난이도');
  ensure(difficulty!=='hard'||s.progress.cleared.includes(stageId),'어려움 난이도는 해당 스테이지 최초 클리어 후 개방됩니다.');
  const mkPlayer=(id,deck,pos,bonus=0)=>({id,pos,gold:220+bonus,deck:shuffle(s,deck),hand:[],discard:[],spellUsed:false,placeCut:0});
  const aiBonus=difficulty==='hard'?80:0;
  s.match={stageId,difficulty,round:1,phase:'prep',current:0,steps:0,turns:0,ended:false,
    players:[mkPlayer(0,s.deck,0),mkPlayer(1,stage.enemyDeck,8,aiBonus)],
    tiles:TILE_ELEMENTS.map((element,i)=>({index:i,element,owner:null,cardId:null,level:0}))};
  for(const p of s.match.players)refill(s,p);
  log(s,`[대전] ${stage.name} · ${difficulty==='hard'?'어려움':'일반'} 시작`);
  const hook=STORY.stages[stageId]?.intro?.hook;
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
export function playSpell(s,id){ensure(legalSpell(s,id),'이 시점에 사용할 수 없는 주문');const m=s.match,p=m.players[m.current],c=CARDS[id];p.gold-=c.cost;
 if(c.effect==='gainGold')p.gold+=c.power;
 if(c.effect==='drain')m.players[1-m.current].gold=Math.max(0,m.players[1-m.current].gold-c.power);
 if(c.effect==='wage'){const lands=ownerLands(m,p.id).length;p.gold+=lands>=3?c.power:c.power2;}
 if(c.effect==='levelPay'){const levels=ownerLands(m,p.id).reduce((a,t)=>a+t.level,0);p.gold+=levels*c.power;}
 if(c.effect==='placeCut')p.placeCut=(p.placeCut||0)+c.power;
 removeHand(p,id);p.spellUsed=true;log(s,`[${m.current?'AI':'나'}] ${c.name} 사용`);
}
export function roll(s){const m=s.match;ensure(m&&m.phase==='prep','굴릴 수 없는 상태');const p=m.players[m.current];const steps=randInt(s,1,4);m.steps=steps;m.salaryNotice=0;
 for(let i=0;i<steps;i++){p.pos=(p.pos+1)%RING.length;if(p.pos===0)p.gold+=65;}
 m.phase='land';const t=m.tiles[p.pos];log(s,`[${m.current?'AI':'나'}] 주사위 ${steps}, ${p.pos}번 칸 (${t.element})`);return steps;
}
export function placementOptions(s,who=s.match?.current){const m=s.match,p=m.players[who],t=m.tiles[p.pos];
 if(m.phase!=='land'||t.index===0||t.index===8||t.owner!==null)return [];
 return p.hand.filter(id=>{const c=CARDS[id];return c.kind==='unit'&&c.cost-Math.min(c.cost,p.placeCut||0)<=p.gold;});
}
export function tileBonus(t,c) {return c.element!=='neutral'&&t.element===c.element?3:0;}
function sides(m,t){return [m.tiles[(t.index+15)%16], m.tiles[(t.index+1)%16]];}
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
export function combatPreview(s,attackerId,itemId=null){const m=s.match,p=m.players[m.current],t=m.tiles[p.pos];
 ensure(m.phase==='land'&&t.owner===1-m.current,'침략할 적 영토가 아닙니다.');
 const a=CARDS[attackerId],d=CARDS[t.cardId],item=itemId?CARDS[itemId]:null;
 ensure(a?.kind==='unit'&&p.hand.includes(attackerId),'공격 유닛 손패 없음');
 if(item){ensure(item.kind==='item'&&p.hand.includes(itemId),'아이템 손패 없음');}
 const am=attackMods(a,t), dm=defendMods(m,t), im=itemMods(item,a,t);
 const attack=a.atk+tileBonus(t,a)+am.atk+im.atk;
 const defenderHP=d.hp+tileBonus(t,d)+(t.level-1)*(d.grow??3)+neighborBonus(m,t,t.owner)+dm.hp+auraHP(m,t);
 const defense=a.hp+am.def+im.def;
 const retaliation=d.atk+tileBonus(t,d)+dm.ret;
 return {attack,defenderHP,defense,retaliation,success:attack>=defenderHP&&defense>retaliation,cost:a.cost+(item?.cost||0),toll:tollOf(m,t),stay:am.stay};
}
export function place(s,id){const m=s.match;ensure(placementOptions(s).includes(id),'배치 불가능');const p=m.players[m.current],t=m.tiles[p.pos],c=CARDS[id];const cut=Math.min(c.cost,p.placeCut||0);p.gold-=c.cost-cut;p.placeCut=0;removeHand(p,id);
 Object.assign(t,{owner:m.current,cardId:id,level:1});log(s,`[${m.current?'AI':'나'}] ${c.name} 배치 (${c.element})`);completeTurn(s);
}
export function upgrade(s){const m=s.match;ensure(m&&m.phase==='land','진행 상태 오류');const p=m.players[m.current],t=m.tiles[p.pos];const cost=45*t.level;
 ensure(t.owner===m.current&&t.level<3&&p.gold>=cost,'강화 불가능');p.gold-=cost;t.level++;
 log(s,`[${m.current?'AI':'나'}] 영토 ${t.index} 강화 → Lv.${t.level} (-${cost}G)`);completeTurn(s);
}
export function invade(s,cardId,itemId=null){const m=s.match;const p=m.players[m.current],t=m.tiles[p.pos];const v=combatPreview(s,cardId,itemId);ensure(p.gold>=v.cost,'공격 비용 부족');
 p.gold-=v.cost;removeHand(p,cardId);if(itemId)removeHand(p,itemId);
 if(v.success){Object.assign(t,{owner:m.current,cardId,level:v.stay||1});
   log(s,`[${m.current?'AI':'나'}] ${CARDS[cardId].name} 침략 성공 (${v.attack}/${v.defenderHP})`);
 } else {const paid=Math.min(p.gold,v.toll);p.gold-=paid;m.players[t.owner].gold+=paid;
   log(s,`[${m.current?'AI':'나'}] 침략 실패 (${v.attack}/${v.defenderHP}) · 통행료 ${paid}G`);
 }
 completeTurn(s);return v.success;
}
export function pass(s){const m=s.match;ensure(m&&m.phase==='land','행동 종료 불가');const t=getLandedTile(s),p=m.players[m.current];
 if(t.owner!==null&&t.owner!==m.current){const toll=tollOf(m,t);const paid=Math.min(toll,p.gold);p.gold-=paid;m.players[t.owner].gold+=paid;log(s,`[${m.current?'AI':'나'}] 통행료 ${paid}G 지불`);}
 else log(s,`[${m.current?'AI':'나'}] 영토 행동 생략`);
 completeTurn(s);
}
function salaryOf(m,who){return who===1&&m.difficulty==='hard'?38:32;}
function grantSalary(s){const m=s.match;if(!m||m.ended)return;const pay=salaryOf(m,m.current);m.players[m.current].gold+=pay;m.salaryNotice=pay;log(s,`[월급] ${m.current?'AI':'나'} 턴 시작 +${pay}G`);}
function completeTurn(s){const m=s.match,p=m.players[m.current];refill(s,p);p.spellUsed=false;m.turns++;
 // Never end a match before a few real decisions. Otherwise award to score leader on turn cap.
 const target=currentStage(s).target+(m.difficulty==='hard'?180:0);
 if(m.round>=8 && goldScore(m,m.current)>=target){finish(s,m.current,'목표 자산 도달');return;}
 if(m.current===1){if(m.round>=currentStage(s).maxRounds){const a=goldScore(m,0),b=goldScore(m,1);finish(s,a>=b?0:1,'턴 제한');return;}m.round++;}
 m.current=1-m.current;m.phase='prep';grantSalary(s);
}
export function availableItem(s){const m=s.match,p=m.players[m.current];return p.hand.filter(id=>CARDS[id].kind==='item');}
function bestSpell(s){
  const m=s.match,p=m.players[m.current],foe=m.players[1-m.current];
  let best=null,bestScore=24;
  for(const id of p.hand.filter(x=>legalSpell(s,x))){
    const c=CARDS[id];
    let score=-999;
    if(c.effect==='gainGold') score=c.power-c.cost;
    else if(c.effect==='drain') score=Math.min(c.power,foe.gold)-c.cost-(p.gold<70?40:0);
    else if(c.effect==='wage'){const lands=ownerLands(m,p.id).length;score=(lands>=3?c.power:c.power2)-c.cost;}
    else if(c.effect==='levelPay'){const levels=ownerLands(m,p.id).reduce((a,t)=>a+t.level,0);score=levels*c.power-c.cost;}
    else if(c.effect==='placeCut') score=Math.min(c.power,28)-c.cost;
    if(score>bestScore){bestScore=score;best=id;}
  }
  return best;
}
/** Same rules as the opponent. No dice rigging; only the evaluation differs by stage style.
 *  Safe to call again if a previous turn stopped on the land step (resume, no second roll). */
export function autoTurn(s){
  const m=s.match;ensure(m&&!m.ended,'진행 중인 대전이 없습니다.');const p=m.players[m.current],stage=currentStage(s);
  if(m.phase==='prep'){const spell=bestSpell(s); if(spell) playSpell(s,spell); roll(s);}
  const t=getLandedTile(s);
  if(t.index===0||t.index===8){pass(s);return;}
  if(t.owner===null){
    const opts=placementOptions(s);
    const ranked=opts.map(id=>{
      const c=CARDS[id];
      const match=tileBonus(t,c);
      const rare={U:6,R:10,E:16,L:22}[c.rarity]||0;
      return {id,score:c.hp*1.1+c.atk*0.9+match*8-c.cost*0.08+(c.trait?rare:0)+(match&&c.trait?12:0)+(stage.style==='fortress'?c.hp*0.5:0)+(stage.style==='aggressive'?c.atk*0.4:0)};
    }).sort((a,b)=>b.score-a.score);
    const reserve=stage.style==='aggressive'?8:20;
    const pick=ranked.length?CARDS[ranked[0].id]:null;
    const pay=pick?pick.cost-Math.min(pick.cost,p.placeCut||0):0;
    if(pick&&p.gold>=pay+reserve){place(s,ranked[0].id);return;}
  } else if(t.owner===m.current){
    const cost=45*t.level;
    // Level 1 stays crackable unless the owner is actually rich. Fortress still walls up later.
    const reserve=(stage.style==='fortress'?(t.level===1?120:70):stage.style==='aggressive'?100:80)-(CARDS[t.cardId]?.trait?30:0);
    if(t.level<3&&p.gold>=cost+reserve){upgrade(s);return;}
  } else {
    const items=availableItem(s),units=p.hand.filter(id=>CARDS[id].kind==='unit');
    const foe=goldScore(m,1-m.current);
    const target=stage.target+(m.difficulty==='hard'?180:0);
    const urgent=foe>target-250||m.round>=stage.maxRounds-3;
    const fights=[];
    for(const id of units){for(const itemId of [null,...items]){
      try{
        const v=combatPreview(s,id,itemId);
        if(v.success&&v.cost<=p.gold){
          const keep=stage.style==='fortress'?40:18;
          if(!urgent && p.gold-v.cost<keep && t.level<2) continue;
          fights.push({id,itemId,score:t.level*55+90-v.cost*0.25+(stage.style==='aggressive'?50:0)+(urgent?40:0)});
        }
      }catch{/* illegal combo */}
    }}
    fights.sort((a,b)=>b.score-a.score);
    if(fights.length){invade(s,fights[0].id,fights[0].itemId);return;}
  }
  pass(s);
}
export function aiTurn(s){ensure(s.match&&s.match.current===1&&!s.match.ended,'AI 턴이 아닙니다.');autoTurn(s);}
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
 const packCount=DAILY_PACKS[difficulty]*(daily?2:1),pulled=[];
 for(let i=0;i<packCount;i++)pulled.push(...generatePack(s,stageId));
 let ticket=false;if((wins-1)>0&&(wins-1)%3===0){s.tickets++;ticket=true;}
 s.lastReward={stageId,first,key,daily,packs:packCount,pulled,ticket,dust:s.dust};
 log(s,`[보상] ${stage.name}: 이 스테이지 카드팩 ${packCount}개${daily?' (오늘 첫 승리 2배)':''}${key?' + 확정 카드':''}${ticket?' + 선택권 1':''}`);
 return s.lastReward;
}
function finish(s,winner,reason){const m=s.match;ensure(m&&!m.ended,'이미 종료됨');m.ended=true;m.winner=winner;m.reason=reason;
 const scores=[goldScore(m,0),goldScore(m,1)];log(s,`[종료] ${winner===0?'승리':'패배'} · ${reason} · ${scores[0]} : ${scores[1]}`);
 if(winner===0){const now=new Date();const day=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
   awardWin(s,m.stageId,m.difficulty,day);
 } else {s.dust+=5;s.lastReward={stageId:m.stageId,loss:true,dust:5};log(s,'[보상] 패배: 제작 재료 +5');}
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
 if(s.deck.length!==DECK_SIZE){
  const need={}; for(const id of STARTER_DECK) need[id]=(need[id]||0)+1;
  for(const [id,n] of Object.entries(need)) s.collection[id]=Math.max(s.collection[id]||0,n);
  s.deck=[...STARTER_DECK];
  s.log.unshift('[이전] 덱 제한이 40장이 되어 시작 덱으로 맞췄습니다. 모아 둔 카드는 남습니다.');
 }
 s.match=null;s.lastReward=null;
 if(!s.story||typeof s.story!=='object') s.story={prologue:false, intro:{}, outro:{}};
 if(!s.story.intro||typeof s.story.intro!=='object') s.story.intro={};
 if(!s.story.outro||typeof s.story.outro!=='object') s.story.outro={};
 if(!s.story.done||typeof s.story.done!=='object') s.story.done={};
 return s;
}
