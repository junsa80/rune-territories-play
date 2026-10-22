// All cards in this prototype are original placeholders, not extracted from any commercial game.
export const VERSION = '0.1.0';
export const DECK_SIZE = 40;
export const COPY_LIMIT = 4;
export const RARITIES = ['C', 'U', 'R', 'E', 'L'];
export const RARITY_NAMES = {C:'커먼',U:'언커먼',R:'레어',E:'엑소틱',L:'레전더리'};
export const ELEMENTS = {neutral:'무속성',fire:'화염',water:'물',earth:'대지',air:'바람'};
export const TRAITS = {
  'root-bind': {name:'뿌리 결속', text:'양옆 대지 아군마다 수비 생명 +레벨.'},
  'cloud-step': {name:'구름걸음', text:'바람 칸에서 공격 +1, 반격 +레벨.'},
  'gate-crack': {name:'관문 균열', text:'침략 공격 +3. 수비 생명 +레벨.'},
  'rain-veil': {name:'비장막', text:'물 칸에서 수비 생명 +2×레벨. 침략 생존 +2.'},
  'twin-oath': {name:'쌍문장', text:'양옆 아군마다 수비 생명 +레벨, 반격 +1.'},
  'double-vow': {name:'이중 맹세', text:'침략 공격 +2, 생존 +2. 수비 생명 +2×레벨.'},
  'forest-wall': {name:'숲의 벽', text:'수비 생명 +2×레벨. 대지 이웃이 있으면 통행료 +12×레벨.'},
  'storm-call': {name:'폭풍 부름', text:'바람 칸 공격 +3, 반격 +2×레벨. 바람 침략 성공 시 Lv.2.'},
  'magma': {name:'용암 세력', text:'화염 칸 공격 +3, 수비 생명 +레벨, 반격 +2×레벨.'},
  'star-scale': {name:'별비늘', text:'침략 공격 +4. 화염 칸이면 수비 생명·반격 +2×레벨, 아니면 생명 +레벨.'},
  'tide-read': {name:'조수 예언', text:'물 칸 수비 생명 +2×레벨, 통행료 +8×레벨. 양옆 물 아군 생명 +레벨.'},
  'world-root': {name:'세계 뿌리', text:'수비 생명 +레벨, 통행료 +4×레벨. 양옆 아군 통행료 +8×이 레벨.'},
  'bastion-hold': {name:'성채 고정', text:'수비 생명 +레벨. 침략 보너스는 없다.'},
  'slow-invest': {name:'축성', text:'수비 생명 +레벨. 통행료 +2×레벨. 지형 보너스는 없다.'}
};
const n=(id,k)=>Array(k).fill(id);
export const CARD_LIST = [
  {id:'path-keeper',name:'길잡이',kind:'unit',element:'neutral',rarity:'C',stage:1,cost:25,atk:3,hp:5,grow:2,desc:'무속성 범용. 강화 폭은 작다.'},
  {id:'pebble-ward',name:'돌틈 파수',kind:'unit',element:'earth',rarity:'C',stage:1,cost:25,atk:2,hp:4,grow:6,desc:'길잡이와 같은 가격. 지금은 약하고 강화 폭이 크다.'},
  {id:'spark-scout',name:'불씨 정찰',kind:'unit',element:'fire',rarity:'C',stage:1,cost:25,atk:4,hp:2,grow:2,desc:'길잡이와 같은 가격. 공격이 높고 생명이 낮다.'},
  {id:'ember-fox',name:'불꽃여우',kind:'unit',element:'fire',rarity:'C',stage:1,cost:28,atk:5,hp:3,grow:2,desc:'당장 공격이 세다. 강화 폭은 작다.'},
  {id:'dew-drop',name:'이슬 방울',kind:'unit',element:'water',rarity:'C',stage:1,cost:28,atk:2,hp:5,grow:4,desc:'불꽃여우와 같은 가격. 공격 대신 수비와 중간 강화.'},
  {id:'breeze-hawk',name:'바람매',kind:'unit',element:'air',rarity:'C',stage:1,cost:27,atk:4,hp:4,grow:2,desc:'균형형. 강화 폭은 작다.'},
  {id:'river-guard',name:'물결수호자',kind:'unit',element:'water',rarity:'C',stage:1,cost:30,atk:3,hp:6,grow:4,desc:'수비형. 강화 폭은 중간.'},
  {id:'reed-lancer',name:'갈대 창병',kind:'unit',element:'air',rarity:'C',stage:1,cost:30,atk:6,hp:2,grow:2,desc:'물결수호자와 같은 가격. 생명은 낮고 공격이 높다. 불꽃여우보다 2G 비싸다.'},
  {id:'moss-turtle',name:'이끼거북',kind:'unit',element:'earth',rarity:'C',stage:1,cost:32,atk:2,hp:7,grow:6,desc:'시작은 평범하다. 레벨이 오를수록 생명 폭이 크다.'},
  {id:'trail-supplies',name:'여행 보급',kind:'spell',element:'neutral',rarity:'U',stage:1,cost:12,effect:'gainGold',power:55,desc:'이동 전: 무조건 55G. 한 턴에 주문 1장.'},
  {id:'three-lands',name:'세 땅의 주머니',kind:'spell',element:'neutral',rarity:'U',stage:1,cost:12,effect:'wage',power:70,power2:30,desc:'같은 가격. 아군 영토 3개 이상이면 70G, 아니면 30G.'},
  {id:'steel-blade',name:'강철 칼날',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,bonus:'atk',desc:'침략 시 공격 +4. 항상.'},
  {id:'stone-shield',name:'석벽 방패',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,bonus:'def',desc:'같은 가격. 생존 +4.'},
  {id:'element-point',name:'속성 칼끝',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:6,bonus:'elem-atk',desc:'같은 가격. 속성이 맞으면 공격 +6, 아니면 +1.'},
  {id:'tiny-charm',name:'작은 부적',kind:'item',element:'neutral',rarity:'C',stage:1,cost:8,power:2,bonus:'atk',desc:'싼 장비. 공격 +2.'},
  {id:'thin-hide',name:'얇은 가죽',kind:'item',element:'neutral',rarity:'C',stage:1,cost:8,power:2,bonus:'def',desc:'같은 가격. 생존 +2.'},
  {id:'gate-breaker',name:'관문 파괴자',kind:'unit',element:'neutral',rarity:'R',stage:1,cost:48,atk:8,hp:5,grow:3,trait:'gate-crack',desc:'침략용 범용 유닛. 강화 폭은 보통.'},
  {id:'rain-sage',name:'비의 현자',kind:'unit',element:'water',rarity:'R',stage:1,cost:46,atk:6,hp:7,grow:6,trait:'rain-veil',desc:'물 속성. 레벨이 오를수록 생명 폭이 크다.'},
  {id:'forest-warden',name:'숲 감시자',kind:'unit',element:'earth',rarity:'E',stage:1,cost:62,atk:7,hp:10,grow:6,trait:'forest-wall',desc:'비싼 방어 유닛. 강화 폭이 크다.'},
  {id:'star-drake',name:'별비늘 용',kind:'unit',element:'fire',rarity:'L',stage:1,cost:85,atk:11,hp:8,grow:2,trait:'star-scale',desc:'비싼 공격 유닛. 몸값은 가격으로 내고, 강화 폭은 작다.'},
  {id:'mist-runner',name:'안개 사냥꾼',kind:'unit',element:'water',rarity:'C',stage:2,cost:34,atk:5,hp:5,grow:2,desc:'물 지형의 기동 유닛. 강화 폭은 작다.'},
  {id:'sand-clock',name:'모래시계 벌레',kind:'unit',element:'neutral',rarity:'C',stage:2,cost:34,atk:3,hp:5,grow:6,desc:'안개 사냥꾼과 같은 가격. 공격은 낮고 강화 폭이 크다. 무속성이라 지형 보너스는 없다.'},
  {id:'root-speaker',name:'뿌리술사',kind:'unit',element:'earth',rarity:'U',stage:2,cost:42,atk:4,hp:9,grow:4,trait:'root-bind',desc:'당장 단단하다. 강화 폭은 중간.'},
  {id:'bastion-moss',name:'성채 이끼',kind:'unit',element:'earth',rarity:'U',stage:2,cost:42,atk:3,hp:8,grow:6,trait:'bastion-hold',desc:'뿌리술사와 같은 가격. 공격은 낮고, 레벨이 오를수록 생명 폭이 더 크다.'},
  {id:'searing-blast',name:'작열의 거래',kind:'spell',element:'fire',rarity:'U',stage:2,cost:20,effect:'drain',power:45,desc:'이동 전: 상대 현금에서 최대 45G 소멸. 내 돈이 되지 않는다.'},
  {id:'ash-contract',name:'재의 계약',kind:'spell',element:'neutral',rarity:'U',stage:2,cost:20,effect:'placeCut',power:25,desc:'같은 가격. 상대 돈을 깎지 않고, 이번 턴 첫 배치를 25G 깎는다.'},
  {id:'twin-crest',name:'쌍문장 기사',kind:'unit',element:'neutral',rarity:'R',stage:2,cost:52,atk:7,hp:8,grow:4,trait:'twin-oath',desc:'혼합 덱용. 강화 폭은 중간.'},
  {id:'arc-bow',name:'아크 활',kind:'item',element:'neutral',rarity:'R',stage:2,cost:24,power:7,bonus:'atk',desc:'침략 시 공격 +7.'},
  {id:'matched-shield',name:'맞방패',kind:'item',element:'neutral',rarity:'R',stage:2,cost:24,power:7,bonus:'def',desc:'아크 활과 같은 가격. 생존 +7.'},
  {id:'invest-golem',name:'축성 골렘',kind:'unit',element:'neutral',rarity:'U',stage:2,cost:40,atk:4,hp:4,grow:6,trait:'slow-invest',desc:'구름사슴과 같은 가격. 지금은 약하고 강화 폭이 크다. 무속성이라 지형 보너스는 없다.'},
  {id:'tempest-giant',name:'폭풍 거인',kind:'unit',element:'air',rarity:'E',stage:2,cost:72,atk:9,hp:11,grow:3,trait:'storm-call',desc:'비싼 바람 유닛. 강화 폭은 보통.'},
  {id:'tidal-oracle',name:'조수의 예언자',kind:'unit',element:'water',rarity:'L',stage:2,cost:95,atk:9,hp:14,grow:6,trait:'tide-read',desc:'비싼 수비. 강화 폭이 크다.'},
  {id:'cinder-squire',name:'잿불 종자',kind:'unit',element:'fire',rarity:'C',stage:3,cost:31,atk:6,hp:3,grow:2,desc:'불꽃여우보다 3G 비싸고 공격이 1 높다. 강화 폭은 같다.'},
  {id:'cloud-stag',name:'구름사슴',kind:'unit',element:'air',rarity:'U',stage:3,cost:40,atk:5,hp:7,grow:2,trait:'cloud-step',desc:'바람 영토의 당장 좋은 몸. 강화 폭은 작다.'},
  {id:'golden-path',name:'황금길',kind:'spell',element:'neutral',rarity:'U',stage:3,cost:18,effect:'gainGold',power:85,desc:'이동 전: 무조건 85G.'},
  {id:'level-tithe',name:'레벨 징수',kind:'spell',element:'neutral',rarity:'U',stage:3,cost:18,effect:'levelPay',power:16,desc:'같은 가격. 아군 영토 레벨 합 ×16G. 땅을 안 키우면 황금길보다 못하다.'},
  {id:'double-oath',name:'이중 맹세자',kind:'unit',element:'neutral',rarity:'R',stage:3,cost:58,atk:8,hp:9,grow:4,trait:'double-vow',desc:'범용 중상급. 강화 폭은 중간.'},
  {id:'mirror-armor',name:'거울 갑옷',kind:'item',element:'neutral',rarity:'R',stage:3,cost:28,power:9,bonus:'def',desc:'맞방패보다 4G 비싸다. 생존 +9.'},
  {id:'volcanic-lord',name:'화산의 군주',kind:'unit',element:'fire',rarity:'E',stage:3,cost:80,atk:10,hp:9,grow:3,trait:'magma',desc:'별비늘 용보다 5G 싸다. 공격은 1 낮고 생명은 1 높다. 강화 폭은 조금 더 크다.'},
  {id:'world-tree',name:'세계나무의 수호자',kind:'unit',element:'earth',rarity:'L',stage:3,cost:105,atk:10,hp:16,grow:6,trait:'world-root',desc:'가장 비싼 수비. 강화 폭이 크다.'}
];
export const CARDS = Object.fromEntries(CARD_LIST.map(c=>[c.id,c]));
export const STARTER_DECK = [...n('path-keeper',4),...n('ember-fox',3),...n('river-guard',3),...n('moss-turtle',3),...n('breeze-hawk',3),...n('pebble-ward',4),...n('spark-scout',3),...n('dew-drop',3),...n('reed-lancer',3),...n('trail-supplies',3),...n('steel-blade',2),...n('stone-shield',1),...n('tiny-charm',2),...n('thin-hide',2),...n('three-lands',1)];
export const STAGES = [
  {id:1,name:'첫 번째 고리',enemy:'여행자 레오',style:'balanced',target:1900,maxRounds:18,focus:'기본 영토 운영',keyCard:'gate-breaker',enemyDeck:[...n('path-keeper',4),...n('ember-fox',4),...n('river-guard',4),...n('moss-turtle',4),...n('breeze-hawk',4),...n('pebble-ward',4),...n('spark-scout',4),...n('dew-drop',4),...n('reed-lancer',4),...n('trail-supplies',2),...n('steel-blade',1),...n('stone-shield',1)]},
  {id:2,name:'깊은 뿌리',enemy:'수호자 미라',style:'fortress',target:2100,maxRounds:20,focus:'영토 방어와 우회',keyCard:'twin-crest',enemyDeck:[...n('root-speaker',4),...n('moss-turtle',4),...n('river-guard',4),...n('mist-runner',4),...n('pebble-ward',4),...n('dew-drop',4),...n('bastion-moss',4),...n('path-keeper',4),...n('stone-shield',4),...n('steel-blade',2),...n('searing-blast',2)]},
  {id:3,name:'폭풍의 문',enemy:'마도사 아르',style:'aggressive',target:2450,maxRounds:22,focus:'강력한 침략과 속성 혼합',keyCard:'double-oath',enemyDeck:[...n('cinder-squire',4),...n('ember-fox',4),...n('spark-scout',4),...n('cloud-stag',4),...n('reed-lancer',4),...n('twin-crest',2),...n('arc-bow',4),...n('searing-blast',2),...n('double-oath',2),...n('tempest-giant',2),...n('volcanic-lord',1),...n('ash-contract',2),...n('invest-golem',2),...n('sand-clock',3)]}
];
export const DUST_GAIN = {C:2,U:6,R:25,E:70,L:160};
export const DUST_COST = {C:12,U:45,R:190,E:500,L:1300};
export const DAILY_PACKS = {normal:1,hard:2};
export const RARITY_WEIGHTS = {
  C:[.72,.19,.075,.013,.002],
  U:[0,.68,.25,.06,.01],
  R:[0,0,.82,.16,.02]
};
export const RING = [
  [0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],
  [4,4],[4,3],[4,2],[4,1],[4,0],[3,0],[2,0],[1,0]
];
export const TILE_ELEMENTS=['neutral','fire','water','earth','air','fire','earth','water','neutral','air','water','earth','fire','air','earth','water'];
