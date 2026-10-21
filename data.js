// All cards in this prototype are original placeholders, not extracted from any commercial game.
export const VERSION = '0.1.0';
export const DECK_SIZE = 12;
export const COPY_LIMIT = 4;
export const RARITIES = ['C', 'U', 'R', 'E', 'L'];
export const RARITY_NAMES = {C:'커먼',U:'언커먼',R:'레어',E:'엑소틱',L:'레전더리'};
export const ELEMENTS = {neutral:'무속성',fire:'화염',water:'물',earth:'대지',air:'바람'};
export const CARD_LIST = [
  {id:'path-keeper',name:'길잡이',kind:'unit',element:'neutral',rarity:'C',stage:1,cost:25,atk:3,hp:5,desc:'무속성 범용 배치 유닛. 속성 불일치 불이익 없음.'},
  {id:'ember-fox',name:'불꽃여우',kind:'unit',element:'fire',rarity:'C',stage:1,cost:28,atk:5,hp:3,desc:'공격에 유리하지만 수비는 약하다.'},
  {id:'river-guard',name:'물결수호자',kind:'unit',element:'water',rarity:'C',stage:1,cost:30,atk:3,hp:6,desc:'수비형 기초 유닛.'},
  {id:'moss-turtle',name:'이끼거북',kind:'unit',element:'earth',rarity:'C',stage:1,cost:32,atk:2,hp:7,desc:'영토 수비에 특화.'},
  {id:'breeze-hawk',name:'바람매',kind:'unit',element:'air',rarity:'C',stage:1,cost:27,atk:4,hp:4,desc:'균형형 기초 유닛.'},
  {id:'trail-supplies',name:'여행 보급',kind:'spell',element:'neutral',rarity:'U',stage:1,cost:12,effect:'gainGold',power:55,desc:'이동 전 사용: 55G 획득. 한 턴에 주문 최대 1장.'},
  {id:'steel-blade',name:'강철 칼날',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,desc:'침략 시 선택: 공격력 +4.'},
  {id:'stone-shield',name:'석벽 방패',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,desc:'침략 시 선택: 생존 판정에 방어력 +4.'},
  {id:'gate-breaker',name:'관문 파괴자',kind:'unit',element:'neutral',rarity:'R',stage:1,cost:48,atk:8,hp:5,desc:'다음 스테이지 고방어 영토 공략에 유용한 범용 유닛.'},
  {id:'rain-sage',name:'비의 현자',kind:'unit',element:'water',rarity:'R',stage:1,cost:46,atk:6,hp:7,desc:'물 속성 보드에서 강한 균형형 유닛.'},
  {id:'forest-warden',name:'숲 감시자',kind:'unit',element:'earth',rarity:'E',stage:1,cost:62,atk:7,hp:10,desc:'높은 비용의 특화 방어 유닛.'},
  {id:'star-drake',name:'별비늘 용',kind:'unit',element:'fire',rarity:'L',stage:1,cost:85,atk:11,hp:8,desc:'희귀한 고비용 공격 유닛. 저비용 카드의 상위호환은 아니다.'},
  {id:'mist-runner',name:'안개 사냥꾼',kind:'unit',element:'water',rarity:'C',stage:2,cost:34,atk:5,hp:5,desc:'물 지형에서 활용하기 좋은 기동 유닛.'},
  {id:'root-speaker',name:'뿌리술사',kind:'unit',element:'earth',rarity:'U',stage:2,cost:42,atk:4,hp:9,desc:'고방어 크리처.'},
  {id:'searing-blast',name:'작열의 거래',kind:'spell',element:'fire',rarity:'U',stage:2,cost:20,effect:'drain',power:45,desc:'이동 전 사용: 상대 현금에서 최대 45G 소멸. 수익으로 전환하지 않음.'},
  {id:'twin-crest',name:'쌍문장 기사',kind:'unit',element:'neutral',rarity:'R',stage:2,cost:52,atk:7,hp:8,desc:'혼합 속성 덱에서도 안정적인 수비·공격 역할.'},
  {id:'arc-bow',name:'아크 활',kind:'item',element:'neutral',rarity:'R',stage:2,cost:24,power:7,desc:'침략 시 공격력 +7.'},
  {id:'tempest-giant',name:'폭풍 거인',kind:'unit',element:'air',rarity:'E',stage:2,cost:72,atk:9,hp:11,desc:'높은 비용과 높은 능력치.'},
  {id:'tidal-oracle',name:'조수의 예언자',kind:'unit',element:'water',rarity:'L',stage:2,cost:95,atk:9,hp:14,desc:'후반을 위한 특수 수비 유닛.'},
  {id:'cinder-squire',name:'잿불 종자',kind:'unit',element:'fire',rarity:'C',stage:3,cost:31,atk:6,hp:3,desc:'저렴한 침략 유닛.'},
  {id:'cloud-stag',name:'구름사슴',kind:'unit',element:'air',rarity:'U',stage:3,cost:40,atk:5,hp:7,desc:'바람 영토에 안정적인 유닛.'},
  {id:'golden-path',name:'황금길',kind:'spell',element:'neutral',rarity:'U',stage:3,cost:18,effect:'gainGold',power:85,desc:'이동 전 사용: 85G 획득.'},
  {id:'double-oath',name:'이중 맹세자',kind:'unit',element:'neutral',rarity:'R',stage:3,cost:58,atk:8,hp:9,desc:'범용성이 높은 중상급 전술 유닛.'},
  {id:'mirror-armor',name:'거울 갑옷',kind:'item',element:'neutral',rarity:'R',stage:3,cost:28,power:9,desc:'침략 시 생존 판정에 방어력 +9.'},
  {id:'volcanic-lord',name:'화산의 군주',kind:'unit',element:'fire',rarity:'E',stage:3,cost:80,atk:12,hp:9,desc:'고비용 공격형 선택지.'},
  {id:'world-tree',name:'세계나무의 수호자',kind:'unit',element:'earth',rarity:'L',stage:3,cost:105,atk:10,hp:16,desc:'영토 방어에 특화된 고비용 카드.'}
];
export const CARDS = Object.fromEntries(CARD_LIST.map(c=>[c.id,c]));
// Stage-1 starter deck is exactly 12 cards; all cards are owned, not just temporarily loaned.
export const STARTER_DECK = ['path-keeper','path-keeper','path-keeper','ember-fox','ember-fox','river-guard','river-guard','moss-turtle','moss-turtle','breeze-hawk','trail-supplies','steel-blade'];
export const STAGES = [
  {id:1,name:'첫 번째 고리',enemy:'여행자 레오',style:'balanced',target:1900,maxRounds:18,focus:'기본 영토 운영',keyCard:'gate-breaker',enemyDeck:['path-keeper','ember-fox','river-guard','moss-turtle','breeze-hawk','ember-fox','river-guard','moss-turtle','path-keeper','trail-supplies','steel-blade','stone-shield']},
  {id:2,name:'깊은 뿌리',enemy:'수호자 미라',style:'fortress',target:2100,maxRounds:20,focus:'영토 방어와 우회',keyCard:'twin-crest',enemyDeck:['root-speaker','root-speaker','moss-turtle','moss-turtle','river-guard','river-guard','mist-runner','mist-runner','path-keeper','stone-shield','steel-blade','searing-blast']},
  {id:3,name:'폭풍의 문',enemy:'마도사 아르',style:'aggressive',target:2450,maxRounds:22,focus:'강력한 침략과 속성 혼합',keyCard:'double-oath',enemyDeck:['cinder-squire','cinder-squire','ember-fox','ember-fox','cloud-stag','cloud-stag','twin-crest','arc-bow','arc-bow','searing-blast','double-oath','tempest-giant']}
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
