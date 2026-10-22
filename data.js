// All cards in this prototype are original placeholders, not extracted from any commercial game.
export const VERSION = '0.1.0';
export const UPDATES = [
  {date:'2026-10-22', title:'전투 예측', text:'상대 장비만 가립니다. 장비가 없을 때의 공격, 생명, 성공과 실패는 보입니다.'},
  {date:'2026-10-22', title:'주문·공격·퇴각', text:'주문 결과, 공격 성공과 막힘, 퇴각 통행료가 보드 위에 뜹니다.'},
  {date:'2026-10-22', title:'전투 결과', text:'공격과 생명, 골드가 누구에게 갔는지, 현재 칸, 속성 일치를 보여 줍니다. 받은 카드는 뒤집혀 나옵니다.'},
  {date:'2026-10-22', title:'업적', text:'첫 패배 핫팩, 3패 재료, 5패 카드 3장, 10패 핫팩. 캠페인에서 받습니다.'},
  {date:'2026-10-22', title:'패배 보상', text:'져도 그 스테이지 커먼 2장과 재료 8. 항복은 없습니다.'},
  {date:'2026-10-22', title:'4장부터 6장', text:'보드가 커지고 모양이 달라집니다. 각 장의 이야기가 있습니다.'}
];
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
  {id:'trail-supplies',name:'여행 보급',kind:'spell',element:'neutral',rarity:'U',stage:1,cost:12,effect:'gainGold',power:55,desc:'한 턴에 1장. 이동 전 또는 전투 지원. 무조건 55G.'},
  {id:'three-lands',name:'세 땅의 주머니',kind:'spell',element:'neutral',rarity:'U',stage:1,cost:12,effect:'wage',power:70,power2:30,desc:'같은 가격. 아군 영토 3개 이상이면 70G, 아니면 30G. 전투 지원으로 내면 확정 뒤에 공개.'},
  {id:'steel-blade',name:'강철 칼날',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,bonus:'atk',desc:'전투 지원. 공격이면 공격 +4, 막으면 반격 +4.'},
  {id:'stone-shield',name:'석벽 방패',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,bonus:'def',desc:'같은 가격. 공격이면 생존 +4, 막으면 생명 +4.'},
  {id:'element-point',name:'속성 칼끝',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:6,bonus:'elem-atk',desc:'같은 가격. 속성이 맞으면 +6, 아니면 +1. 공격은 공격력, 수비는 반격.'},
  {id:'tiny-charm',name:'작은 부적',kind:'item',element:'neutral',rarity:'C',stage:1,cost:8,power:2,bonus:'atk',desc:'싼 장비. 공격이면 공격 +2, 막으면 반격 +2.'},
  {id:'thin-hide',name:'얇은 가죽',kind:'item',element:'neutral',rarity:'C',stage:1,cost:8,power:2,bonus:'def',desc:'같은 가격. 공격이면 생존 +2, 막으면 생명 +2.'},
  {id:'gate-breaker',name:'관문 파괴자',kind:'unit',element:'neutral',rarity:'R',stage:1,cost:48,atk:8,hp:5,grow:3,trait:'gate-crack',desc:'침략용 범용 유닛. 강화 폭은 보통.'},
  {id:'rain-sage',name:'비의 현자',kind:'unit',element:'water',rarity:'R',stage:1,cost:46,atk:6,hp:7,grow:6,trait:'rain-veil',desc:'물 속성. 레벨이 오를수록 생명 폭이 크다.'},
  {id:'forest-warden',name:'숲 감시자',kind:'unit',element:'earth',rarity:'E',stage:1,cost:62,atk:7,hp:10,grow:6,trait:'forest-wall',desc:'비싼 방어 유닛. 강화 폭이 크다.'},
  {id:'star-drake',name:'별비늘 용',kind:'unit',element:'fire',rarity:'L',stage:1,cost:85,atk:11,hp:8,grow:2,trait:'star-scale',desc:'비싼 공격 유닛. 몸값은 가격으로 내고, 강화 폭은 작다.'},
  {id:'mist-runner',name:'안개 사냥꾼',kind:'unit',element:'water',rarity:'C',stage:2,cost:34,atk:5,hp:5,grow:2,desc:'물 지형의 기동 유닛. 강화 폭은 작다.'},
  {id:'sand-clock',name:'모래시계 벌레',kind:'unit',element:'neutral',rarity:'C',stage:2,cost:34,atk:3,hp:5,grow:6,desc:'안개 사냥꾼과 같은 가격. 공격은 낮고 강화 폭이 크다. 무속성이라 지형 보너스는 없다.'},
  {id:'root-speaker',name:'뿌리술사',kind:'unit',element:'earth',rarity:'U',stage:2,cost:42,atk:4,hp:9,grow:4,trait:'root-bind',desc:'당장 단단하다. 강화 폭은 중간.'},
  {id:'bastion-moss',name:'성채 이끼',kind:'unit',element:'earth',rarity:'U',stage:2,cost:42,atk:3,hp:8,grow:6,trait:'bastion-hold',desc:'뿌리술사와 같은 가격. 공격은 낮고, 레벨이 오를수록 생명 폭이 더 크다.'},
  {id:'searing-blast',name:'작열의 거래',kind:'spell',element:'fire',rarity:'U',stage:2,cost:20,effect:'drain',power:45,desc:'한 턴에 1장. 이동 전 또는 전투 지원. 상대 현금에서 최대 45G 소멸.'},
  {id:'ash-contract',name:'재의 계약',kind:'spell',element:'neutral',rarity:'U',stage:2,cost:20,effect:'placeCut',power:25,desc:'같은 가격. 이번 배치를 25G 깎는다. 전투 지원으로 내면 확정 뒤에 공개.'},
  {id:'twin-crest',name:'쌍문장 기사',kind:'unit',element:'neutral',rarity:'R',stage:2,cost:52,atk:7,hp:8,grow:4,trait:'twin-oath',desc:'혼합 덱용. 강화 폭은 중간.'},
  {id:'arc-bow',name:'아크 활',kind:'item',element:'neutral',rarity:'R',stage:2,cost:24,power:7,bonus:'atk',desc:'전투 지원. 공격이면 공격 +7, 막으면 반격 +7.'},
  {id:'matched-shield',name:'맞방패',kind:'item',element:'neutral',rarity:'R',stage:2,cost:24,power:7,bonus:'def',desc:'아크 활과 같은 가격. 공격이면 생존 +7, 막으면 생명 +7.'},
  {id:'invest-golem',name:'축성 골렘',kind:'unit',element:'neutral',rarity:'U',stage:2,cost:40,atk:4,hp:4,grow:6,trait:'slow-invest',desc:'구름사슴과 같은 가격. 지금은 약하고 강화 폭이 크다. 무속성이라 지형 보너스는 없다.'},
  {id:'tempest-giant',name:'폭풍 거인',kind:'unit',element:'air',rarity:'E',stage:2,cost:72,atk:9,hp:11,grow:3,trait:'storm-call',desc:'비싼 바람 유닛. 강화 폭은 보통.'},
  {id:'tidal-oracle',name:'조수의 예언자',kind:'unit',element:'water',rarity:'L',stage:2,cost:95,atk:9,hp:14,grow:6,trait:'tide-read',desc:'비싼 수비. 강화 폭이 크다.'},
  {id:'cinder-squire',name:'잿불 종자',kind:'unit',element:'fire',rarity:'C',stage:3,cost:31,atk:6,hp:3,grow:2,desc:'불꽃여우보다 3G 비싸고 공격이 1 높다. 강화 폭은 같다.'},
  {id:'cloud-stag',name:'구름사슴',kind:'unit',element:'air',rarity:'U',stage:3,cost:40,atk:5,hp:7,grow:2,trait:'cloud-step',desc:'바람 영토의 당장 좋은 몸. 강화 폭은 작다.'},
  {id:'golden-path',name:'황금길',kind:'spell',element:'neutral',rarity:'U',stage:3,cost:18,effect:'gainGold',power:85,desc:'한 턴에 1장. 이동 전 또는 전투 지원. 무조건 85G.'},
  {id:'level-tithe',name:'레벨 징수',kind:'spell',element:'neutral',rarity:'U',stage:3,cost:18,effect:'levelPay',power:16,desc:'같은 가격. 아군 영토 레벨 합 ×16G. 땅을 안 키우면 황금길보다 못하다.'},
  {id:'double-oath',name:'이중 맹세자',kind:'unit',element:'neutral',rarity:'R',stage:3,cost:58,atk:8,hp:9,grow:4,trait:'double-vow',desc:'범용 중상급. 강화 폭은 중간.'},
  {id:'mirror-armor',name:'거울 갑옷',kind:'item',element:'neutral',rarity:'R',stage:3,cost:28,power:9,bonus:'def',desc:'맞방패보다 4G 비싸다. 공격이면 생존 +9, 막으면 생명 +9.'},
  {id:'volcanic-lord',name:'화산의 군주',kind:'unit',element:'fire',rarity:'E',stage:3,cost:80,atk:10,hp:9,grow:3,trait:'magma',desc:'별비늘 용보다 5G 싸다. 공격은 1 낮고 생명은 1 높다. 강화 폭은 조금 더 크다.'},
  {id:'world-tree',name:'세계나무의 수호자',kind:'unit',element:'earth',rarity:'L',stage:3,cost:105,atk:10,hp:16,grow:6,trait:'world-root',desc:'가장 비싼 수비. 강화 폭이 크다.'},
  {id:'quay-spark',name:'부두 불씨',kind:'unit',element:'fire',rarity:'C',stage:4,cost:36,atk:5,hp:4,grow:2,desc:'세로로 긴 고리의 화염. 강화 폭은 작다.'},
  {id:'ink-jelly',name:'잉크 해파리',kind:'unit',element:'water',rarity:'U',stage:4,cost:44,atk:3,hp:8,grow:4,trait:'rain-veil',desc:'장부 쪽 수비. 공격은 낮고 강화 폭은 중간.'},
  {id:'debt-oak',name:'빚의 참나무',kind:'unit',element:'earth',rarity:'R',stage:4,cost:54,atk:5,hp:10,grow:4,trait:'root-bind',desc:'비싼 대지. 공격은 뿌리술사보다 높고, 강화 폭은 숲 감시자보다 작다.'},
  {id:'tall-kite',name:'높은 연',kind:'unit',element:'air',rarity:'E',stage:4,cost:74,atk:10,hp:12,grow:2,trait:'cloud-step',desc:'폭풍 거인보다 2G 비싸다. 공격과 생명은 더 높고 강화 폭은 작다.'},
  {id:'quiet-colossus',name:'침묵 거상',kind:'unit',element:'neutral',rarity:'L',stage:4,cost:110,atk:8,hp:14,grow:6,trait:'slow-invest',desc:'무속성이라 지형 보너스는 없다. 강화 폭이 크다.'},
  {id:'lane-wisp',name:'골목 도깨비불',kind:'unit',element:'air',rarity:'C',stage:5,cost:33,atk:5,hp:3,grow:2,desc:'측량 고리의 싼 바람. 갈대 창병보다 공격이 낮고 생명이 높다.'},
  {id:'notch-boar',name:'눈금 멧돼지',kind:'unit',element:'earth',rarity:'U',stage:5,cost:39,atk:4,hp:7,grow:6,trait:'bastion-hold',desc:'이끼거북보다 7G 비싸다. 공격이 더 높고 생명은 같다.'},
  {id:'measure-heron',name:'측량 학',kind:'unit',element:'water',rarity:'R',stage:5,cost:50,atk:6,hp:8,grow:2,trait:'rain-veil',desc:'잉크 해파리보다 공격이 높고 강화 폭은 작다.'},
  {id:'flare-mason',name:'불씨 석공',kind:'unit',element:'fire',rarity:'E',stage:5,cost:50,atk:7,hp:6,grow:3,trait:'magma',desc:'화염 중간 몸. 부두 불씨보다 비싸고 숫자가 크다.'},
  {id:'seal-knight',name:'봉인 기사',kind:'unit',element:'neutral',rarity:'L',stage:5,cost:115,atk:9,hp:13,grow:4,trait:'twin-oath',desc:'무속성. 침묵 거상보다 공격은 높고 강화 폭은 작다.'},
  {id:'spire-mole',name:'첨탑 두더지',kind:'unit',element:'earth',rarity:'C',stage:6,cost:37,atk:3,hp:6,grow:6,desc:'싼 대지. 이끼거북보다 공격이 높고 생명은 낮다.'},
  {id:'gulf-moth',name:'만의 나방',kind:'unit',element:'air',rarity:'R',stage:6,cost:56,atk:7,hp:7,grow:3,trait:'cloud-step',desc:'바람 중급. 구름사슴보다 강화 폭이 조금 크다.'},
  {id:'payroll-crab',name:'급여 게',kind:'unit',element:'water',rarity:'E',stage:6,cost:88,atk:7,hp:12,grow:4,trait:'tide-read',desc:'조수의 예언자보다 싸다. 공격·생명·강화 폭은 모두 낮다.'},
  {id:'crown-ash',name:'왕관 재',kind:'unit',element:'fire',rarity:'E',stage:6,cost:88,atk:12,hp:7,grow:2,trait:'magma',desc:'별비늘 용보다 3G 비싸다. 공격은 1 높고 생명은 1 낮다.'},
  {id:'contract-titan',name:'계약 거인',kind:'unit',element:'neutral',rarity:'L',stage:6,cost:120,atk:10,hp:16,grow:4,trait:'double-vow',desc:'가장 비싼 무속성. 침묵 거상보다 공격은 높고 강화 폭은 작다.'}
];
export const CARDS = Object.fromEntries(CARD_LIST.map(c=>[c.id,c]));
export const STARTER_DECK = [...n('path-keeper',4),...n('ember-fox',3),...n('river-guard',3),...n('moss-turtle',3),...n('breeze-hawk',3),...n('pebble-ward',4),...n('spark-scout',3),...n('dew-drop',3),...n('reed-lancer',3),...n('trail-supplies',3),...n('steel-blade',2),...n('stone-shield',1),...n('tiny-charm',2),...n('thin-hide',2),...n('three-lands',1)];
export const STAGES = [
  {id:1,name:'첫 번째 고리',enemy:'여행자 레오',style:'balanced',target:1900,maxRounds:18,board:{w:5,h:5},focus:'작은 사각형 16칸',keyCard:'gate-breaker',enemyDeck:[...n('path-keeper',4),...n('ember-fox',4),...n('river-guard',4),...n('moss-turtle',4),...n('breeze-hawk',4),...n('pebble-ward',4),...n('spark-scout',4),...n('dew-drop',4),...n('reed-lancer',4),...n('trail-supplies',2),...n('steel-blade',1),...n('stone-shield',1)]},
  {id:2,name:'깊은 뿌리',enemy:'수호자 미라',style:'fortress',target:2400,maxRounds:20,board:{w:7,h:5},focus:'가로로 긴 20칸',keyCard:'twin-crest',enemyDeck:[...n('root-speaker',4),...n('moss-turtle',4),...n('river-guard',4),...n('mist-runner',4),...n('pebble-ward',4),...n('dew-drop',4),...n('bastion-moss',4),...n('path-keeper',4),...n('stone-shield',4),...n('steel-blade',2),...n('searing-blast',2)]},
  {id:3,name:'폭풍의 문',enemy:'마도사 아르',style:'aggressive',target:2800,maxRounds:22,board:{w:7,h:7},focus:'큰 사각형 24칸',keyCard:'double-oath',enemyDeck:[...n('cinder-squire',4),...n('ember-fox',4),...n('spark-scout',4),...n('cloud-stag',4),...n('reed-lancer',4),...n('twin-crest',2),...n('arc-bow',4),...n('searing-blast',2),...n('double-oath',2),...n('tempest-giant',2),...n('volcanic-lord',1),...n('ash-contract',2),...n('invest-golem',2),...n('sand-clock',3)]},
  {id:4,name:'닫힌 장부',enemy:'감사 노엘',style:'fortress',target:3000,maxRounds:24,board:{w:5,h:9},focus:'세로로 긴 24칸',keyCard:'debt-oak',enemyDeck:[...n('quay-spark',4),...n('ink-jelly',4),...n('debt-oak',4),...n('tall-kite',2),...n('quiet-colossus',1),...n('moss-turtle',4),...n('bastion-moss',4),...n('stone-shield',4),...n('root-speaker',4),...n('pebble-ward',4),...n('steel-blade',2),...n('searing-blast',3)]},
  {id:5,name:'이름 없는 칸',enemy:'측량사 린',style:'balanced',target:3200,maxRounds:26,board:{w:9,h:5},focus:'가로로 긴 24칸',keyCard:'flare-mason',enemyDeck:[...n('flare-mason',4),...n('measure-heron',4),...n('notch-boar',4),...n('lane-wisp',4),...n('seal-knight',2),...n('reed-lancer',4),...n('cinder-squire',4),...n('arc-bow',4),...n('cloud-stag',4),...n('spark-scout',4),...n('golden-path',2)]},
  {id:6,name:'마지막 고용',enemy:'고용주 세르',style:'aggressive',target:3800,maxRounds:28,board:{w:9,h:7},focus:'큰 직사각형 28칸',keyCard:'contract-titan',enemyDeck:[...n('contract-titan',2),...n('crown-ash',4),...n('payroll-crab',4),...n('gulf-moth',4),...n('spire-mole',4),...n('world-tree',1),...n('volcanic-lord',2),...n('tempest-giant',2),...n('double-oath',2),...n('tidal-oracle',1),...n('mirror-armor',2),...n('level-tithe',2),...n('star-drake',1),...n('forest-warden',2),...n('gate-breaker',2),...n('twin-crest',2),...n('arc-bow',3)]}
];
export const DUST_GAIN = {C:2,U:6,R:25,E:70,L:160};
export const DUST_COST = {C:12,U:45,R:190,E:500,L:1300};
export const DAILY_PACKS = {normal:1,hard:2};
// Win turns vs stage 1 in the same-policy test: 2장 1.2배, 3장 1.6배, 4·5장 1.7배, 6장 2.1배.
export const STAGE_PACKS = {1:1,2:1,3:2,4:2,5:2,6:3};
export const HOT_PACK = ['R','U','U','C','C'];
export const ACHIEVEMENTS = [
  {id:'first-loss', name:'첫 패배', reward:'hotpack', text:'업적 보상으로 핫팩 1개. 해금 전 카드를 포함한 전체에서, 레어 이상 1장, 언커먼 이상 2장, 커먼 2장.'},
  {id:'first-win', name:'첫 승리', reward:'dust', dust:30, text:'업적 보상으로 재료 +30.'},
  {id:'first-upgrade', name:'첫 강화', reward:'dust', dust:20, text:'업적 보상으로 재료 +20.'},
  {id:'first-match', name:'속성 일치', reward:'dust', dust:15, text:'업적 보상으로 재료 +15.'},
  {id:'clear-1', name:'1장 클리어', reward:'dust', dust:10, text:'업적 보상으로 재료 +10.'},
  {id:'clear-2', name:'2장 클리어', reward:'dust', dust:10, text:'업적 보상으로 재료 +10.'},
  {id:'clear-3', name:'3장 클리어', reward:'dust', dust:10, text:'업적 보상으로 재료 +10.'},
  {id:'clear-4', name:'4장 클리어', reward:'dust', dust:10, text:'업적 보상으로 재료 +10.'},
  {id:'clear-5', name:'5장 클리어', reward:'dust', dust:10, text:'업적 보상으로 재료 +10.'},
  {id:'clear-6', name:'6장 클리어', reward:'dust', dust:10, text:'업적 보상으로 재료 +10.'},
  {id:'loss-3', name:'3패', reward:'dust', dust:40, text:'3번 이상 지면 재료 +40.'},
  {id:'loss-5', name:'5패', reward:'pack', floors:['U','C','C'], text:'5번 이상 지면 전체 카드에서 3장. 언커먼 이상 1장, 커먼 2장.'},
  {id:'loss-10', name:'10패', reward:'hotpack', text:'10번 이상 지면 핫팩 1개. 해금 전 카드 포함.'}
];
export const RARITY_WEIGHTS = {
  C:[.72,.19,.075,.013,.002],
  U:[0,.68,.25,.06,.01],
  R:[0,0,.82,.16,.02]
};
export function makeBoard(w,h){
  const ring=[];
  for(let c=0;c<w;c++) ring.push([0,c]);
  for(let r=1;r<h;r++) ring.push([r,w-1]);
  for(let c=w-2;c>=0;c--) ring.push([h-1,c]);
  for(let r=h-2;r>=1;r--) ring.push([r,0]);
  const cornerIdx=[0,w-1,w+h-2,2*w+h-3];
  const corners=new Set(cornerIdx);
  const elements=ring.map(()=>'neutral');
  const order=['fire','water','earth','air'];
  let el=0;
  for(let i=0;i<ring.length;i++){
    if(corners.has(i)){if(i!==0) el=(el+1)%4;continue;}
    elements[i]=order[el];
  }
  return {w,h,ring,elements,aiStart:w+h-2,corners:[
    {index:cornerIdx[0],id:'pay',name:'급여성소',text:'도착하면 40G.'},
    {index:cornerIdx[1],id:'altar',name:'화염 제단',text:'내 화염 영토마다 16G. 없으면 24G.'},
    {index:cornerIdx[2],id:'levy',name:'징수소',text:'상대에게 22G.'},
    {index:cornerIdx[3],id:'forge',name:'대장간',text:'다음 배치가 20G 할인.'}
  ]};
}
const FIRST=makeBoard(5,5);
export const RING=FIRST.ring;
export const TILE_ELEMENTS=FIRST.elements;
export const CORNERS=Object.fromEntries(FIRST.corners.map(c=>[c.index,c]));
export const STORY={
  prologue:{
    kicker:'프롤로그', title:'고리가 월급을 준다', face:'player',
    pages:[
      {face:'player', speaker:'나', text:'열여섯 칸이 고리로 닫혀 있다. 네 귀퉁이는 이벤트고, 나머지 칸은 속성이 있는 땅이다. 빈 거점은 없다. 고리는 걷는 사람에게 턴마다 월급을 건넨다.'},
      {face:'player', speaker:'나', text:'카드는 장부다. 싼 카드가 약한 카드는 아니고, 비싼 카드가 항상 윗자리도 아니다. 어떤 땅은 지금 세고, 어떤 땅은 레벨이 올라야 숨이 붙는다.'},
      {face:'leo', speaker:'여행자 레오', text:'첫 고리는 내가 연다. 빈 칸에 이름을 붙이되, 가진 돈을 다 넣지는 마. 고리는 성급한 사람보다, 다음 턴에도 남는 사람을 기억해.'}
    ]
  },
  stages:{
    1:{
      intro:{kicker:'1장 · 첫 번째 고리', title:'빈 칸에 이름을 붙인다', face:'leo', hook:'빈 칸에 이름을 붙여. 돈은 남겨.',
        pages:[
          {speaker:'여행자 레오', text:'나는 많이 안 쌓아. 빈 칸이 보이면 집을 두고, 이미 가진 땅은 필요할 때만 키워. 이길 약속은 안 해. 네 장부가 다음 고리까지 가면 돼.'},
          {speaker:'여행자 레오', text:'같은 값인데 다른 카드가 왜 있는지, 여기서 봐. 하나는 지금 세고, 하나는 나중에 커. 나는 그 차이를 걸으러 왔어.'}
        ]},
      outro:{kicker:'1장 · 이후', title:'문은 밀면 열린다', face:'leo',
        pages:[
          {speaker:'여행자 레오', text:'문은 세게 밀면 열려. 관문 파괴자는 그 밀기야. 가져가. 다음 고리는 그렇게 호락호락하지 않아.'},
          {speaker:'여행자 레오', text:'다음 사람은 미라다. 빈 칸보다 키운 칸을 믿어. 찍기만 하고 가면, 통행료로 녹아.'}
        ]}
    },
    2:{
      intro:{kicker:'2장 · 깊은 뿌리', title:'머무는 사람', face:'mira', hook:'한 칸을 키운 사람과, 칸만 찍은 사람은 다른 길을 걸어.',
        pages:[
          {speaker:'수호자 미라', text:'레오는 걷게 했어. 나는 머물게 해. 한 칸을 세 번 키운 사람과, 세 칸을 한 번 찍은 사람은 다른 고리를 걸어.'},
          {speaker:'수호자 미라', text:'양옆이 같은 속성이면 땅은 혼자가 아니야. 뿌리술사는 이웃을 믿고, 성채 이끼는 시간을 믿어. 값은 같아. 고르는 건 너야.'}
        ]},
      outro:{kicker:'2장 · 이후', title:'양옆이 있어야 선다', face:'mira',
        pages:[
          {speaker:'수호자 미라', text:'버텼구나. 쌍문장은 혼자 서는 카드가 아니야. 양옆에 같은 편이 있을 때 비로소 세지지.'},
          {speaker:'수호자 미라', text:'아르의 문은 바람이야. 지키는 법만으로는 안 열려. 이번엔 빼앗아야 해.'}
        ]}
    },
    3:{
      intro:{kicker:'3장 · 폭풍의 문', title:'빼앗는 사람', face:'ar', hook:'지키는 법은 배웠지. 이번엔 빼앗아 봐.',
        pages:[
          {speaker:'마도사 아르', text:'월급은 걷게 하려고 있고, 통행료는 머물게 하려고 있어. 나는 그 둘을 같은 판에서 부순다.'},
          {speaker:'마도사 아르', text:'화염은 지금 때리고, 바람은 문을 연다. 비싼 몸이 싼 몸을 항상 지우지는 않아. 다만 여기서 망설이면, 네 땅이 먼저 없어져.'}
        ]},
      outro:{kicker:'에필로그', title:'고리는 그대로다', face:'ar',
        pages:[
          {speaker:'마도사 아르', text:'문은 열렸다. 네가 왕이라서 연 게 아니야. 붙일 칸에 이름을 붙이고, 키울 땅은 키우고, 빼앗을 때만 빼앗아서야.'},
          {face:'player', speaker:'나', text:'고리는 그대로가 아니다. 다음은 더 길고, 모양도 다르다. 레오는 걷고, 미라는 지키고, 아르는 문을 연다.'}
        ]}
    },
    4:{
      intro:{kicker:'4장 · 닫힌 장부', title:'월급은 적혀 있다', face:'noel', hook:'월급은 준 게 아니야. 적혀 있는 거야.',
        pages:[
          {speaker:'감사 노엘', text:'문은 열렸더군. 고리는 그걸 승리라고 적지 않아. 네가 받은 월급, 네가 낸 통행료, 네가 버린 칸. 장부는 그 셋만 기억해.'},
          {speaker:'감사 노엘', text:'레오는 걷게 하고, 미라는 머물게 하고, 아르는 빼앗게 했어. 나는 그 값이 맞는지 봐. 같은 값의 카드를 고른 이유까지 대신 적어 주지는 않아.'}
        ]},
      outro:{kicker:'4장 · 이후', title:'빚은 남은 땅이다', face:'noel',
        pages:[
          {speaker:'감사 노엘', text:'빚은 잃은 땅이 아니야. 아직 네 이름인 땅이야. 키우지 않은 칸은 장부에 빈칸으로 남아.'},
          {speaker:'감사 노엘', text:'도장은 찍었다. 다음 사람은 돈을 세지 않아. 칸에 붙은 이름을 재.'}
        ]}
    },
    5:{
      intro:{kicker:'5장 · 이름 없는 칸', title:'이름을 재다', face:'lin', hook:'이름을 붙이기 전에, 그 칸이 원래 무엇이었는지 봐.',
        pages:[
          {speaker:'측량사 린', text:'노엘의 장부는 숫자를 믿지. 나는 칸을 믿어. 불이 아닌 칸에 불의 집을 두면, 집은 서 있어도 그 칸은 너를 도와주지 않아.'},
          {speaker:'측량사 린', text:'무속성은 어디든 서. 대신 어디에서도 보태지 않아. 편한 것과 맞는 것은 달라.'}
        ]},
      outro:{kicker:'5장 · 이후', title:'이웃은 같은 이름일 때', face:'lin',
        pages:[
          {speaker:'측량사 린', text:'양옆이 같은 이름일 때만 땅이 손을 잡아. 미라가 말한 뿌리는, 이름을 재고 나서야 이어져.'},
          {speaker:'측량사 린', text:'측량은 끝났어. 마지막 사람은 월급을 넣는 이야. 그 돈을 끊으면 고리도 멈춘다고 믿을 거야.'}
        ]}
    },
    6:{
      intro:{kicker:'6장 · 마지막 고용', title:'월급을 끊지 않는다', face:'ser', hook:'월급을 끊으면, 고리도 너를 잊는다.',
        pages:[
          {speaker:'고용주 세르', text:'월급은 내가 넣는다. 걷는 사람이 없으면 고리는 빈 칸이야. 승리의 방이 아니야.'},
          {speaker:'고용주 세르', text:'레오, 미라, 아르, 노엘, 린. 다들 자기 장부만 맞다고 해. 너는 그 장부를 한 권으로 걸었어. 맞는 장부는 없어. 다음 턴이 있을 뿐이야.'}
        ]},
      outro:{kicker:'6장 · 이후', title:'장부는 열려 있다', face:'ser',
        pages:[
          {speaker:'고용주 세르', text:'월급을 거두면 빚도 사라지고, 네 땅의 이름도 풀려. 그 계약은 이미 한 번 봤어. 아무도 다음 턴을 갖지 못했지.'},
          {face:'player', speaker:'나', text:'월급은 그대로 둔다. 고리는 닫지 않는다. 빈 칸은 아직 이름이 없고, 장부는 다음 걸음을 위해 열려 있다.'}
        ]}
    }
  }
};
