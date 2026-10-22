// All cards in this prototype are original placeholders, not extracted from any commercial game.
export const VERSION = '0.1.0';
export const UI_BUILD = '0.1.47';
export const UPDATES = [
  {date:'2026-10-22', title:'표지와 타이틀', text:'처음 열면 룬 고리 판 앞의 여행자들 그림과 함께 타이틀 화면이 나온 뒤 프롤로그로 이어집니다. 판의 칸 글자를 10px 이상으로 키웠고, 4인 시범의 빈 칸에서는 겹치던 이름을 숨겼습니다. 규칙·점수·보상은 그대로입니다.'},
  {date:'2026-10-22', title:'주사위 눈금 수정', text:'굴리는 동안에도 1~4 눈금만 표시하고, 마지막 눈금이 실제 이동 칸 수와 정확히 일치합니다. 확정 뒤에는 같은 눈금을 유지합니다. 이동 규칙·확률·저장 데이터는 그대로입니다.'},
  {date:'2026-10-22', title:'4인 시범', text:'3인 시범을 한 번 하거나 2장을 깨면 나·레오·미라·아르 넷이 24칸 고리를 도는 4인 시범이 열립니다. 52턴, 목표 5200점, 끝나면 자산이 가장 많은 사람이 이깁니다. 나와 상관없는 AI끼리의 턴은 이동 연출 없이 한 줄로 넘어가고, ▶▶ 빨리 넘기기는 이제 싸움만 보여 줍니다(3인 시범도 같이 빨라졌습니다). 두 시범 모두 보상이 생겼습니다: 1장 1:1 보상을 플레이 시간에 맞춰 늘린 값으로, 3인 시범 승리 카드팩 3개·패배 커먼 6장+재료 24, 4인 시범 승리 카드팩 4개·패배 커먼 9장+재료 35. 처음 이기면 업적 재료 +30(3인)·+40(4인). 항복은 보상 없음.'},
  {date:'2026-10-22', title:'3인 시범', text:'1장을 깨면 캠페인에서 나·레오·미라 셋이 20칸 고리를 도는 3인 시범을 할 수 있습니다. 36턴, 목표 3800점, 끝나면 자산이 가장 많은 사람이 이깁니다. 나와 상관없는 AI끼리의 일은 한 줄로 요약하고, ▶▶ 버튼으로 빨리 넘깁니다. 보상은 없습니다.'},
  {date:'2026-10-22', title:'둘째 권·그림·소리', text:'7~18장 이야기(읽기 전용, 6장 클리어 뒤 차례로 열림)와 둘째 권 카드 14장(6장 보상·제작 풀)을 넣었습니다. 말·주사위·효과 그림과 새 효과음, 이음매 없는 배경음을 씁니다. 소리 설정은 그대로입니다.'},
  {date:'2026-10-22', title:'카드 역할 점검', text:'모래시계 벌레는 무속성 수비형(생명 7), 왕관 재는 화염 침략형(공격 14·생명 6)으로 구분했습니다. 현재 전투식에서 효력이 없는 반격·침략 생존 설명을 정리했습니다.'},
  {date:'2026-10-22', title:'덱 연구·한 장씩 개봉', text:'유닛 속성·주문·장비 수를 누르면 카드가 걸러집니다. 이름 붙인 덱 8개를 보관하고, 카드는 한 장씩 공개합니다. 보드에 이동 방향과 상세 보기를 넣었습니다.'},
  {date:'2026-10-22', title:'저장·조작 안정화', text:'편집 중인 덱도 새로고침과 JSON 백업으로 보존합니다. 손패를 골라도 가로 스크롤 위치를 유지하며, 연출 중 중복 저장을 줄였습니다.'},
  {date:'2026-10-22', title:'첫 판', text:'못 뚫는 땅은 통행료를 내고 지나가는 버튼이 앞에 옵니다. 1장 상대는 빈 칸을 덜 집어 갑니다.'},
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
  'cloud-step': {name:'구름걸음', text:'바람 칸 침략 공격 +1.'},
  'gate-crack': {name:'관문 균열', text:'침략 공격 +3. 수비 생명 +레벨.'},
  'rain-veil': {name:'비장막', text:'물 칸 수비 생명 +2×레벨.'},
  'twin-oath': {name:'쌍문장', text:'양옆 아군마다 수비 생명 +레벨.'},
  'double-vow': {name:'이중 맹세', text:'침략 공격 +2. 수비 생명 +2×레벨.'},
  'forest-wall': {name:'숲의 벽', text:'수비 생명 +2×레벨. 대지 이웃이 있으면 통행료 +12×레벨.'},
  'storm-call': {name:'폭풍 부름', text:'바람 칸 침략 공격 +3. 바람 침략 성공 시 Lv.2.'},
  'magma': {name:'용암 세력', text:'화염 칸 침략 공격 +3, 수비 생명 +레벨.'},
  'star-scale': {name:'별비늘', text:'침략 공격 +4. 화염 칸 수비 생명 +2×레벨, 그 외 수비 생명 +레벨.'},
  'tide-read': {name:'조수 예언', text:'물 칸 수비 생명 +2×레벨, 통행료 +8×레벨. 양옆 물 아군 생명 +레벨.'},
  'world-root': {name:'세계 뿌리', text:'수비 생명 +레벨, 통행료 +4×레벨. 양옆 아군 통행료 +8×이 레벨.'},
  'bastion-hold': {name:'성채 고정', text:'수비 생명 +레벨. 침략 보너스는 없다.'},
  'slow-invest': {name:'축성', text:'수비 생명 +레벨. 통행료 +2×레벨. 지형 보너스는 없다.'}
};
const n=(id,k)=>Array(k).fill(id);
export const CARD_LIST = [
  {id:'path-keeper',name:'길잡이',kind:'unit',element:'neutral',rarity:'C',stage:1,cost:25,atk:3,hp:5,grow:2,desc:'수비 역할이며, 무속성이라 땅 보너스는 없다.'},
  {id:'pebble-ward',name:'돌틈 파수',kind:'unit',element:'earth',rarity:'C',stage:1,cost:25,atk:2,hp:4,grow:6,desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'spark-scout',name:'불씨 정찰',kind:'unit',element:'fire',rarity:'C',stage:1,cost:25,atk:4,hp:2,grow:2,desc:'길잡이와 같은 가격. 공격이 높고 생명이 낮다.'},
  {id:'ember-fox',name:'불꽃여우',kind:'unit',element:'fire',rarity:'C',stage:1,cost:28,atk:5,hp:3,grow:2,desc:'공격 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'dew-drop',name:'이슬 방울',kind:'unit',element:'water',rarity:'C',stage:1,cost:28,atk:2,hp:5,grow:4,desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'breeze-hawk',name:'바람매',kind:'unit',element:'air',rarity:'C',stage:1,cost:27,atk:4,hp:4,grow:2,desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'river-guard',name:'물결수호자',kind:'unit',element:'water',rarity:'C',stage:1,cost:30,atk:3,hp:6,grow:4,desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'reed-lancer',name:'갈대 창병',kind:'unit',element:'air',rarity:'C',stage:1,cost:30,atk:6,hp:2,grow:2,desc:'물결수호자와 같은 가격. 생명은 낮고 공격이 높다. 불꽃여우보다 2G 비싸다.'},
  {id:'moss-turtle',name:'이끼거북',kind:'unit',element:'earth',rarity:'C',stage:1,cost:32,atk:2,hp:7,grow:6,desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'trail-supplies',name:'여행 보급',kind:'spell',element:'neutral',rarity:'U',stage:1,cost:12,effect:'gainGold',power:55,desc:'한 턴에 1장. 이동 전 또는 전투 지원. 무조건 55G.'},
  {id:'three-lands',name:'세 땅의 주머니',kind:'spell',element:'neutral',rarity:'U',stage:1,cost:12,effect:'wage',power:70,power2:30,desc:'같은 가격. 아군 영토 3개 이상이면 70G, 아니면 30G. 전투 지원으로 내면 확정 뒤에 공개.'},
  {id:'steel-blade',name:'강철 칼날',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,bonus:'atk',desc:'침략용 지원. 공격 +4. 수비에는 효과가 없다.'},
  {id:'stone-shield',name:'석벽 방패',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:4,bonus:'def',desc:'수비용 지원. 수비 생명 +4. 침략에는 효과가 없다.'},
  {id:'element-point',name:'속성 칼끝',kind:'item',element:'neutral',rarity:'U',stage:1,cost:15,power:6,bonus:'elem-atk',desc:'침략용 지원. 공격 유닛과 땅 속성이 맞으면 공격 +6, 아니면 +1.'},
  {id:'tiny-charm',name:'작은 부적',kind:'item',element:'neutral',rarity:'C',stage:1,cost:8,power:2,bonus:'atk',desc:'침략용 지원. 공격 +2. 강철 칼날보다 저렴하다.'},
  {id:'thin-hide',name:'얇은 가죽',kind:'item',element:'neutral',rarity:'C',stage:1,cost:8,power:2,bonus:'def',desc:'수비용 지원. 수비 생명 +2. 석벽 방패보다 저렴하다.'},
  {id:'gate-breaker',name:'관문 파괴자',kind:'unit',element:'neutral',rarity:'R',stage:1,cost:48,atk:8,hp:5,grow:3,trait:'gate-crack',desc:'공격 역할이며, 무속성이라 땅 보너스는 없다.'},
  {id:'rain-sage',name:'비의 현자',kind:'unit',element:'water',rarity:'R',stage:1,cost:46,atk:6,hp:7,grow:6,trait:'rain-veil',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'forest-warden',name:'숲 감시자',kind:'unit',element:'earth',rarity:'E',stage:1,cost:62,atk:7,hp:10,grow:6,trait:'forest-wall',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'star-drake',name:'별비늘 용',kind:'unit',element:'fire',rarity:'L',stage:1,cost:85,atk:11,hp:8,grow:2,trait:'star-scale',desc:'공격 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'mist-runner',name:'안개 사냥꾼',kind:'unit',element:'water',rarity:'C',stage:2,cost:34,atk:5,hp:5,grow:2,desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'sand-clock',name:'모래시계 벌레',kind:'unit',element:'neutral',rarity:'C',stage:2,cost:34,atk:3,hp:7,grow:6,desc:'길잡이보다 9G 비싸고 생명이 2 높다. 무속성 수비형.'},
  {id:'root-speaker',name:'뿌리술사',kind:'unit',element:'earth',rarity:'U',stage:2,cost:42,atk:4,hp:9,grow:4,trait:'root-bind',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'bastion-moss',name:'성채 이끼',kind:'unit',element:'earth',rarity:'U',stage:2,cost:42,atk:3,hp:8,grow:6,trait:'bastion-hold',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'searing-blast',name:'작열의 거래',kind:'spell',element:'fire',rarity:'U',stage:2,cost:20,effect:'drain',power:45,desc:'한 턴에 1장. 이동 전 또는 전투 지원. 상대 현금에서 최대 45G 소멸.'},
  {id:'ash-contract',name:'재의 계약',kind:'spell',element:'neutral',rarity:'U',stage:2,cost:20,effect:'placeCut',power:100,desc:'다음 유닛 배치 비용을 최대 100G 할인. 비싼 유닛용 준비 주문. 싼 유닛에 쓰면 할인도 작다. 침략 비용에는 적용되지 않는다.'},
  {id:'twin-crest',name:'쌍문장 기사',kind:'unit',element:'neutral',rarity:'R',stage:2,cost:52,atk:7,hp:8,grow:4,trait:'twin-oath',desc:'수비 역할이며, 무속성이라 땅 보너스는 없다.'},
  {id:'arc-bow',name:'아크 활',kind:'item',element:'neutral',rarity:'R',stage:2,cost:24,power:7,bonus:'atk',desc:'침략용 지원. 공격 +7. 수비에는 효과가 없다.'},
  {id:'matched-shield',name:'맞방패',kind:'item',element:'neutral',rarity:'R',stage:2,cost:24,power:7,bonus:'def',desc:'수비용 지원. 수비 생명 +7. 침략에는 효과가 없다.'},
  {id:'invest-golem',name:'축성 골렘',kind:'unit',element:'neutral',rarity:'U',stage:2,cost:40,atk:4,hp:4,grow:6,trait:'slow-invest',desc:'수비 역할이며, 무속성이라 땅 보너스는 없다.'},
  {id:'tempest-giant',name:'폭풍 거인',kind:'unit',element:'air',rarity:'E',stage:2,cost:72,atk:9,hp:11,grow:3,trait:'storm-call',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'tidal-oracle',name:'조수의 예언자',kind:'unit',element:'water',rarity:'L',stage:2,cost:95,atk:9,hp:14,grow:6,trait:'tide-read',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'cinder-squire',name:'잿불 종자',kind:'unit',element:'fire',rarity:'C',stage:3,cost:31,atk:6,hp:3,grow:2,desc:'공격 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'cloud-stag',name:'구름사슴',kind:'unit',element:'air',rarity:'U',stage:3,cost:40,atk:5,hp:7,grow:2,trait:'cloud-step',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'golden-path',name:'황금길',kind:'spell',element:'neutral',rarity:'U',stage:3,cost:18,effect:'gainGold',power:85,desc:'한 턴에 1장. 이동 전 또는 전투 지원. 무조건 85G.'},
  {id:'level-tithe',name:'레벨 징수',kind:'spell',element:'neutral',rarity:'U',stage:3,cost:18,effect:'levelPay',power:16,desc:'같은 가격. 아군 영토 레벨 합 ×16G. 땅을 안 키우면 황금길보다 못하다.'},
  {id:'double-oath',name:'이중 맹세자',kind:'unit',element:'neutral',rarity:'R',stage:3,cost:58,atk:8,hp:9,grow:4,trait:'double-vow',desc:'수비 역할이며, 무속성이라 땅 보너스는 없다.'},
  {id:'mirror-armor',name:'거울 갑옷',kind:'item',element:'neutral',rarity:'R',stage:3,cost:28,power:9,bonus:'def',desc:'수비용 지원. 수비 생명 +9. 맞방패보다 4G 비싸다.'},
  {id:'volcanic-lord',name:'화산의 군주',kind:'unit',element:'fire',rarity:'E',stage:3,cost:80,atk:10,hp:9,grow:3,trait:'magma',desc:'공격 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'world-tree',name:'세계나무의 수호자',kind:'unit',element:'earth',rarity:'L',stage:3,cost:105,atk:10,hp:16,grow:6,trait:'world-root',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'quay-spark',name:'부두 불씨',kind:'unit',element:'fire',rarity:'C',stage:4,cost:36,atk:5,hp:4,grow:2,desc:'공격 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'ink-jelly',name:'잉크 해파리',kind:'unit',element:'water',rarity:'U',stage:4,cost:44,atk:3,hp:8,grow:4,trait:'rain-veil',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'debt-oak',name:'빚의 참나무',kind:'unit',element:'earth',rarity:'R',stage:4,cost:54,atk:5,hp:10,grow:4,trait:'root-bind',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'tall-kite',name:'높은 연',kind:'unit',element:'air',rarity:'E',stage:4,cost:74,atk:10,hp:12,grow:2,trait:'cloud-step',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'quiet-colossus',name:'침묵 거상',kind:'unit',element:'neutral',rarity:'L',stage:4,cost:110,atk:8,hp:14,grow:6,trait:'slow-invest',desc:'수비 역할이며, 무속성이라 땅 보너스는 없다.'},
  {id:'lane-wisp',name:'골목 도깨비불',kind:'unit',element:'air',rarity:'C',stage:5,cost:33,atk:5,hp:3,grow:2,desc:'측량 고리의 싼 바람. 갈대 창병보다 공격이 낮고 생명이 높다.'},
  {id:'notch-boar',name:'눈금 멧돼지',kind:'unit',element:'earth',rarity:'U',stage:5,cost:39,atk:4,hp:7,grow:6,trait:'bastion-hold',desc:'이끼거북보다 7G 비싸다. 공격이 더 높고 생명은 같다.'},
  {id:'measure-heron',name:'측량 학',kind:'unit',element:'water',rarity:'R',stage:5,cost:50,atk:6,hp:8,grow:2,trait:'rain-veil',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'flare-mason',name:'불씨 석공',kind:'unit',element:'fire',rarity:'E',stage:5,cost:50,atk:7,hp:6,grow:3,trait:'magma',desc:'화염 중간 몸. 부두 불씨보다 비싸고 숫자가 크다.'},
  {id:'seal-knight',name:'봉인 기사',kind:'unit',element:'neutral',rarity:'L',stage:5,cost:115,atk:9,hp:13,grow:4,trait:'twin-oath',desc:'수비 역할이며, 무속성이라 땅 보너스는 없다.'},
  {id:'spire-mole',name:'첨탑 두더지',kind:'unit',element:'earth',rarity:'C',stage:6,cost:37,atk:3,hp:6,grow:6,desc:'싼 대지. 이끼거북보다 공격이 높고 생명은 낮다.'},
  {id:'gulf-moth',name:'만의 나방',kind:'unit',element:'air',rarity:'R',stage:6,cost:56,atk:7,hp:7,grow:3,trait:'cloud-step',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'payroll-crab',name:'급여 게',kind:'unit',element:'water',rarity:'E',stage:6,cost:88,atk:7,hp:12,grow:4,trait:'tide-read',desc:'수비 역할이며, 맞는 땅이면 생명에 땅 레벨만 더한다.'},
  {id:'crown-ash',name:'왕관 재',kind:'unit',element:'fire',rarity:'E',stage:6,cost:88,atk:14,hp:6,grow:2,trait:'magma',desc:'화염 칸 침략 공격 17. 별비늘 용보다 강하게 치지만 수비 생명이 낮다.'},
  {id:'contract-titan',name:'계약 거인',kind:'unit',element:'neutral',rarity:'L',stage:6,cost:120,atk:10,hp:16,grow:4,trait:'double-vow',desc:'수비 역할이며, 무속성이라 땅 보너스는 없다.'},
  // 둘째 권 (2026-10-22, GrokBot 반영). 6장 클리어 후 보상·제작 풀. 전투 식 불변.
  {id:'tide-glass',name:'조등 유리',kind:'unit',element:'water',rarity:'C',stage:6,cost:38,atk:2,hp:7,grow:4,token:true,book:2,desc:'조수가 남긴 유리는 물의 칸에 서야 결이 살아 있다.'},
  {id:'notch-kite',name:'눈금 솔개',kind:'unit',element:'air',rarity:'C',stage:6,cost:39,atk:5,hp:4,grow:2,token:true,book:2,desc:'눈금이 새긴 솔개는 바람의 칸 위에서만 줄을 맞춘다.'},
  {id:'nameless-ward',name:'무명 파수',kind:'unit',element:'neutral',rarity:'U',stage:6,cost:46,atk:4,hp:6,grow:4,trait:'bastion-hold',token:true,book:2,desc:'이름 없는 파수는 어느 색에도 기대지 않고 그 칸을 지킨다.'},
  {id:'cinder-lance',name:'불씨 창',kind:'unit',element:'fire',rarity:'U',stage:6,cost:46,atk:7,hp:4,grow:2,trait:'magma',token:true,book:2,desc:'불씨가 된 가는 창은 불의 땅에 서야 식지 않는다.'},
  {id:'ebb-gate',name:'썰물 문',kind:'unit',element:'water',rarity:'R',stage:6,cost:58,atk:5,hp:9,grow:4,trait:'tide-read',token:true,book:2,desc:'낮은 썰물 문은 물의 칸에서 다음 물결을 들여보낸다.'},
  {id:'ring-hawk',name:'고리 매',kind:'unit',element:'air',rarity:'R',stage:6,cost:58,atk:8,hp:5,grow:2,trait:'cloud-step',token:true,book:2,desc:'얇은 고리를 도는 매는 바람의 칸을 따라 자리를 옮긴다.'},
  {id:'wall-root',name:'성벽 뿌리',kind:'unit',element:'earth',rarity:'E',stage:6,cost:92,atk:6,hp:12,grow:6,trait:'forest-wall',token:true,book:2,desc:'이끼 먹은 뿌리가 낮은 벽이 되어 땅의 칸을 감싼다.'},
  {id:'pact-flame',name:'계약 불꽃',kind:'unit',element:'fire',rarity:'L',stage:6,cost:125,atk:13,hp:9,grow:2,trait:'star-scale',token:true,book:2,desc:'계약으로 남은 불꽃은 약속한 불의 칸을 떠나지 않는다.'},
  {id:'blank-post',name:'공백 말뚝',kind:'unit',element:'neutral',rarity:'U',stage:6,cost:48,atk:5,hp:5,grow:4,trait:'slow-invest',token:true,book:2,desc:'색칠하지 않은 말뚝은 어느 칸에나 서나, 어느 땅도 그것을 돕지 않는다.'},
  {id:'kiln-brand',name:'가마 낙인',kind:'unit',element:'fire',rarity:'U',stage:6,cost:50,atk:8,hp:3,grow:2,trait:'magma',token:true,book:2,desc:'달아오른 가마의 낙인은 불의 땅에 찍혀야 식지 않는다.'},
  {id:'well-lid',name:'우물 뚜껑',kind:'unit',element:'water',rarity:'R',stage:6,cost:60,atk:4,hp:10,grow:4,trait:'rain-veil',token:true,book:2,desc:'돌로 된 우물 뚜껑은 물의 칸을 덮어야 새는 물을 품는다.'},
  {id:'slip-reed',name:'미끄럼 갈대',kind:'unit',element:'air',rarity:'R',stage:6,cost:60,atk:9,hp:4,grow:2,trait:'cloud-step',token:true,book:2,desc:'거센 바람에 누운 갈대는 바람의 칸에서만 미끄러져 자리를 옮긴다.'},
  {id:'terrace-boar',name:'단 멧돼지',kind:'unit',element:'earth',rarity:'E',stage:6,cost:96,atk:7,hp:11,grow:6,trait:'root-bind',token:true,book:2,desc:'다져진 흙의 멧돼지는 땅의 낮은 단에 서야 그 칸을 지킨다.'},
  {id:'oath-ember',name:'맹세 잔화',kind:'unit',element:'fire',rarity:'L',stage:6,cost:128,atk:14,hp:8,grow:2,trait:'star-scale',token:true,book:2,desc:'얇은 금테 안의 잔화는 맹세한 불의 칸을 떠나지 않는다.'}
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
// 3인 시범 (2026-10-22, GrokBot). 1:1 스테이지 목록과 목표 점수는 건드리지 않는 별도 설정. 보상 없음.
export const TRIO_STAGE = {id:100,trial:true,players:3,record:'trio',minutes:10.0,achievement:'trio-clear',packStage:1,name:'3인 시범',enemy:'레오 · 미라',faces:['leo','mira'],names:['레오','미라'],style:'balanced',target:3800,maxRounds:36,board:{w:6,h:6},gentle:400,focus:'고리 20칸 · 셋이 한 고리',hook:'셋이 한 고리를 걷는다. 누가 먼저 무너지는지 보자.',
  get enemyDecks(){return [STAGES[0].enemyDeck,STAGES[1].enemyDeck];}};
// 4인 시범 (2026-10-22, GrokBot). 3인 시범을 한 번 하거나 2장을 깨면 열림. 보상은 아래 TRIAL_REWARD_BASE. compress: 나와 무관한 AI 턴은 이동 연출 없이 한 줄.
// 시범 보상 (2026-10-22, 사용자 결정). 1:1 보상표는 그대로 두고 시범 전용 항목을 따로 둔다.
// 기준: 1장 1:1 보통(오늘 첫 승리 아님) 승리 = 카드팩 1개, 패배 = 커먼 2장 + 재료 8, 측정 중앙값 3.3분(생각 10초, 빨리 넘기기 끔).
// 시범 보상 = 기준 ÷ 3.3분 × 그 모드 중앙값 분, 반올림. 항복은 보상 없음.
export const TRIAL_REWARD_BASE = {minutes:3.3, winPacks:1, lossCommons:2, lossDust:8};
export function trialReward(minutes){const k=minutes/TRIAL_REWARD_BASE.minutes;return {winPacks:Math.round(TRIAL_REWARD_BASE.winPacks*k),lossCommons:Math.round(TRIAL_REWARD_BASE.lossCommons*k),lossDust:Math.round(TRIAL_REWARD_BASE.lossDust*k)};}
export const QUAD_STAGE = {id:101,trial:true,players:4,record:'quad',minutes:14.3,achievement:'quad-clear',packStage:2,compress:true,name:'4인 시범',enemy:'레오 · 미라 · 아르',faces:['leo','mira','ar'],names:['레오','미라','아르'],style:'balanced',target:5200,maxRounds:52,board:{w:7,h:7},gentle:400,focus:'고리 24칸 · 넷이 한 고리',hook:'넷이 한 고리를 걷는다. 길이 좁아진다.',
  get enemyDecks(){return [STAGES[0].enemyDeck,STAGES[1].enemyDeck,STAGES[0].enemyDeck];}};
export const TRIALS = [TRIO_STAGE, QUAD_STAGE];
export const HARD_HINTS = {
  1:{threat:'상대는 시작 골드와 매턴 수입이 더 많습니다.',goal:'저렴한 유닛으로 빈 땅을 먼저 확보하고, 여행 보급 같은 수입 주문으로 투자를 이어가세요.',tools:'저비용 유닛 · 수입 주문 · 석벽 방패'},
  2:{threat:'대지 유닛이 이웃과 연결되면 수비 생명이 높아집니다.',goal:'무리한 침략을 줄이고, 높은 공격 유닛에 공격 장비를 더해 수비 생명을 넘겨 보세요.',tools:'관문 파괴자 · 강철 칼날 · 높은 공격력'},
  3:{threat:'상대는 공격 유닛과 아크 활로 영토를 빼앗으려 합니다.',goal:'중요한 땅은 수비 생명 장비로 지키고, 상대가 약하게 지킨 칸을 공격 장비로 노리세요.',tools:'맞방패 · 아크 활 · 수비 생명이 높은 유닛'},
  4:{threat:'성채 이끼와 뿌리술사, 방패를 섞은 수비형 덱입니다.',goal:'상대 지원이 공개되기 전에는 성공을 확신하지 마세요. 침략 자금과 내 영토 점수도 함께 준비하세요.',tools:'공격 장비 · 수입 주문 · 영토 강화'},
  5:{threat:'속성이 다른 여러 유닛과 공격 장비를 사용합니다.',goal:'내 유닛과 땅의 속성을 맞추고, 상대 유닛의 수비 생명을 확인해 공격할 칸을 고르세요.',tools:'속성이 맞는 수비 유닛 · 공격 장비 · 유연한 무속성 유닛'},
  6:{threat:'비싼 특성 유닛과 높은 공격 지원을 함께 사용합니다.',goal:'골드를 침략에 모두 쓰지 말고, 중요한 영토를 지킬 방패와 다음 턴 배치 자금을 남기세요.',tools:'황금길 같은 수입 주문 · 거울 갑옷 · 높은 수비 생명'}
};
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
  {id:'trio-clear', name:'3인 시범 첫 승리', reward:'dust', dust:30, text:'3인 시범에서 처음 이기면 재료 +30 (한 번만).'},
  {id:'quad-clear', name:'4인 시범 첫 승리', reward:'dust', dust:40, text:'4인 시범에서 처음 이기면 재료 +40 (한 번만).'},
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
    },
    // 7~18장: 읽기 전용 장. 전투 없음. 6장 클리어 뒤 차례로 열림.
    7:{"intro": {"kicker": "일곱째 장 · 등대의 칸", "title": "남는 집이 땅과 같아야 한다", "face": "hael", "hook": "가져간 칸에 다른 집을 남기면, 그 땅은 너를 지켜 주지 않는다.", "pages": [{"face": "hael", "speaker": "등대지 하엘", "text": "월급은 그대로다. 나는 네가 가져간 칸에, 어떤 집을 남겼는지만 본다."}, {"face": "hael", "speaker": "등대지 하엘", "text": "그 칸과 같은 집을 남기면, 땅이 너를 지킨다. 다른 집이면 서 있어도, 땅은 지켜 주지 않는다."}]}, "outro": {"kicker": "일곱째 장 · 이후", "title": "빛은 같은 집만 품는다", "face": "hael", "pages": [{"face": "hael", "speaker": "등대지 하엘", "text": "가져오는 일과 남기는 일은 다르다. 남은 집이 땅과 같아야, 그 칸이 다음에도 너를 지킨다."}, {"face": "hael", "speaker": "등대지 하엘", "text": "내 불은 여기까지다. 온은 못 닿은 공격만 적고, 그 값을 통행으로 남긴다."}]}},
    8:{"intro": {"kicker": "여덟째 장 · 못 닿은 칼", "title": "통행은 안 지운다", "face": "on", "hook": "공격이 지키는 이의 생명에 못 닿으면, 카드는 없고 통행료는 남는다.", "pages": [{"face": "on", "speaker": "징세리 온", "text": "하엘은 남는 집을 봤다. 나는 공격이 지키는 이의 생명에 닿았는지만 적는다."}, {"face": "on", "speaker": "징세리 온", "text": "못 닿으면 그 카드는 장부에서 빠지고, 통행료는 그대로 낸다. 공격하는 쪽의 생명으로는 칸을 못 가져온다."}]}, "outro": {"kicker": "여덟째 장 · 이후", "title": "치는 쪽의 숨은 안 센다", "face": "on", "pages": [{"face": "on", "speaker": "징세리 온", "text": "닿으면 칸의 이름이 바뀐다. 못 닿으면 카드만 사라지고, 통행은 내 줄에 남는다."}, {"face": "on", "speaker": "징세리 온", "text": "공격한 자의 생명은 점령의 줄이 아니다. 이안의 둘째 책은 열려 있고, 아직 글자가 없다."}]}},
    9:{"intro": {"kicker": "아홉째 장 · 빈 둘째 권", "title": "책은 열렸고 이름은 없다", "face": "ian", "hook": "둘째 책은 열려 있으나 비어 있다. 고리는 닫지 마라.", "pages": [{"face": "ian", "speaker": "폐권 이안", "text": "첫째 권은 월급을 남긴 채로 끝났다. 둘째 책은 펼쳐 두었으나, 적은 이름이 없다."}, {"face": "ian", "speaker": "폐권 이안", "text": "새 이름들이 밖에서 기다린다. 고리를 닫으면, 그들은 들어올 칸이 없다."}]}, "outro": {"kicker": "아홉째 장 · 이후", "title": "빈 권은 폐하지 않는다", "face": "ian", "pages": [{"face": "ian", "speaker": "폐권 이안", "text": "나는 책을 덮는 자다. 빈 둘째 권을 덮으면 기다리는 이름이 지워지니, 이번엔 덮지 않는다."}, {"face": "ian", "speaker": "폐권 이안", "text": "나. 둘째 책은 펼쳐 둔다. 고리는 닫지 않고, 새 이름은 아직 장부 밖에 있다."}]}},
    10:{"intro": {"kicker": "열째 장 · 카드에 앉힌 이름", "title": "기다리는 이름은 카드에 적는다", "face": "seal", "hook": "장부 밖에서 기다리던 이름을, 나는 빈 권이 아니라 카드에 적는다.", "pages": [{"face": "seal", "speaker": "적명리 서", "text": "이안은 둘째 권을 덮지 않았다. 나는 그 밖에 선 이름들을 장부에 가두지 않고, 카드의 면에 적는다."}, {"face": "seal", "speaker": "적명리 서", "text": "적힌 이름은 아직 땅에 서지 않는다. 카드에 앉았을 뿐이고, 고리는 닫히지 않았다."}]}, "outro": {"kicker": "열째 장 · 이후", "title": "적은 일은 가두는 일이 아니다", "face": "seal", "pages": [{"face": "seal", "speaker": "적명리 서", "text": "이름을 카드에 적는 일과, 그 이름을 권 속에 넣는 일은 다르다. 나는 적기만 하고, 넣지 않는다."}, {"face": "seal", "speaker": "적명리 서", "text": "카드는 이름을 품고 아직 밖에 있다. 네 색은 한 줄에 섞여 있고, 색을 가르는 이가 다음에 온다."}]}},
    11:{"intro": {"kicker": "열한째 장 · 네 색", "title": "색을 갈라야 땅이 알아본다", "face": "seal", "hook": "불, 물, 바람, 땅의 색을 한 줄에 두면, 카드는 자기 칸을 찾지 못한다.", "pages": [{"face": "seal", "speaker": "분색리 담", "text": "서는 기다리는 이름을 카드에 적었다. 나는 그 카드의 색을 화염, 물, 바람, 대지, 네 갈래로 가른다."}, {"face": "seal", "speaker": "분색리 담", "text": "화염은 화염의 땅만 알아보고, 물은 물의 땅만 알아본다. 바람과 대지도 그와 같아서, 다른 색의 칸은 서 있어도 집이 되지 않는다."}]}, "outro": {"kicker": "열한째 장 · 이후", "title": "색은 집을 고를 뿐", "face": "seal", "pages": [{"face": "seal", "speaker": "분색리 담", "text": "네 색은 이제 서로 섞이지 않는다. 맞는 색의 땅에 선 집만, 그 땅이 자기 것으로 알아본다."}, {"face": "seal", "speaker": "분색리 담", "text": "무색은 네 갈래 밖에 두고, 색으로 땅을 고르지 않는다. 갈라 둔 색은 여기까지고, 빈 권은 아직 덮이지 않았다."}]}},
    12:{"intro": {"kicker": "열두째 장 · 빈 줄", "title": "덮지 않고 다음 이름을 기다린다", "face": "seal", "hook": "둘째 권은 여전히 펼쳐 두고, 빈 줄은 아직 오지 않은 이름의 자리다.", "pages": [{"face": "seal", "speaker": "대기리 한", "text": "서는 이름을 적고, 담은 색을 갈랐다. 나는 그 책을 덮지 않고, 빈 줄 하나를 다음 이름에게 남겨 둔다."}, {"face": "seal", "speaker": "대기리 한", "text": "카드에 앉은 이름도, 아직 밖의 이름도, 고리가 열려 있어야 한다. 덮으면 그 줄이 사라진다."}]}, "outro": {"kicker": "열두째 장 · 이후", "title": "기다림은 폐권이 아니다", "face": "seal", "pages": [{"face": "seal", "speaker": "대기리 한", "text": "이안은 빈 권을 폐하지 않았다. 나도 폐하지 않는다. 다음 이름이 오기 전에는, 이 책이 끝난 것이 아니다."}, {"face": "seal", "speaker": "대기리 한", "text": "월급은 남아 있고, 고리는 열려 있다. 나는 덮개 없이 앉아, 다음 이름을 기다린다."}]}},
    13:{"intro": {"kicker": "열셋째 장 · 적힌 이름", "title": "글자는 아직 집이 아니다", "face": "seal", "hook": "카드에 적힌 이름은, 제 색의 땅에 서기 전에는 집이 아니다.", "pages": [{"face": "seal", "speaker": "서명리 결", "text": "한은 다음 이름을 기다리며 책을 덮지 않았다. 나는 이미 적힌 이름이 집인지 아닌지만 가른다."}, {"face": "seal", "speaker": "서명리 결", "text": "이름은 카드에 앉아 있어도, 제 색 위에 서기 전에는 집이 아니다. 다른 색의 칸에서는 글자로 남을 뿐이다."}]}, "outro": {"kicker": "열셋째 장 · 이후", "title": "서는 색이 집을 정한다", "face": "seal", "pages": [{"face": "seal", "speaker": "서명리 결", "text": "서가 적은 이름도, 담이 가른 색도, 땅에 서기 전에는 집이 아니다. 제 색 위에 선 뒤에야 그 칸이 알아본다."}, {"face": "seal", "speaker": "서명리 결", "text": "나는 이름을 집으로 올리지 않고, 서는 색만 적는다. 고리는 열려 있고, 낮은 집을 보는 이가 다음에 온다."}]}},
    14:{"intro": {"kicker": "열넷째 장 · 낮은 집", "title": "맞는 색은 첫 파수다", "face": "seal", "hook": "한 겹의 땅에 생명이 낮은 집이 서면 빼앗기 쉽다. 맞는 색은 첫 지킴이지, 쇠벽이 아니다.", "pages": [{"face": "seal", "speaker": "야경리 밤", "text": "결은 제 색 위에 선 이름만 집이라 했다. 나는 그 집이 아직 낮을 때, 그 칸이 빼앗기는지를 본다."}, {"face": "seal", "speaker": "야경리 밤", "text": "한 겹의 땅에 생명이 낮은 집이 있으면, 그 칸은 빼앗기 쉽다. 맞는 색이 먼저 지키나, 그것은 쇠로 된 벽이 아니다."}]}, "outro": {"kicker": "열넷째 장 · 이후", "title": "색은 문을 잠그지 않는다", "face": "seal", "pages": [{"face": "seal", "speaker": "야경리 밤", "text": "색이 맞으면 땅이 집을 알아본다. 알아보는 일과, 아무도 못 들어오게 잠그는 일은 같지 않다."}, {"face": "seal", "speaker": "야경리 밤", "text": "나는 첫 파수를 색에 맡기고, 쇠문은 달지 않는다. 한 칸만 맞는 색은 아직 긴 줄이 아니다."}]}},
    15:{"intro": {"kicker": "열다섯째 장 · 같은 이웃", "title": "양쪽이 같아야 줄이 된다", "face": "seal", "hook": "이웃한 두 땅이 같은 색이어야 한 줄이 된다. 한 칸만 맞으면 벽이 아니다.", "pages": [{"face": "seal", "speaker": "연쇄리 울", "text": "밤은 맞는 색을 첫 파수라 하고, 쇠벽은 아니라고 했다. 나는 그 색이 옆 칸에도 같은지를 본다."}, {"face": "seal", "speaker": "연쇄리 울", "text": "이웃한 두 땅이 같은 색이어야 한 줄이 된다. 한쪽만 맞으면 벽이 아니고, 집은 외따로 선다."}]}, "outro": {"kicker": "열다섯째 장 · 이후", "title": "외딴 색은 줄을 이루지 못한다", "face": "seal", "pages": [{"face": "seal", "speaker": "연쇄리 울", "text": "줄은 양쪽이 같을 때에만 생긴다. 한 칸의 색은 파수일 뿐, 이어진 담장이 되지 않는다."}, {"face": "seal", "speaker": "연쇄리 울", "text": "나는 줄을 잇기만 하고 고리를 닫지 않는다. 월급이 끊기면 이 줄도 다음으로 못 간다."}]}},
    16:{"intro": {"kicker": "열여섯째 장 · 끊지 않는 월급", "title": "월급이 있어야 고리가 돈다", "face": "seal", "hook": "월급은 그대로 둔다. 끊으면 고리가 멈추니, 닫지 마라.", "pages": [{"face": "seal", "speaker": "급여리 전", "text": "울은 같은 색의 이웃을 줄이라 했다. 나는 그 줄이 돌 수 있게, 월급이 남아 있는지만 적는다."}, {"face": "seal", "speaker": "급여리 전", "text": "월급은 첫째 권에서 남긴 그대로다. 그것을 끊으면 고리가 멈추고, 다음 칸으로 가지 못한다."}]}, "outro": {"kicker": "열여섯째 장 · 이후", "title": "닫지 말고 남겨 두라", "face": "seal", "pages": [{"face": "seal", "speaker": "급여리 전", "text": "온이 통행을 남겼듯, 나는 월급을 자르지 않는다. 자르면 고리가 멈추고, 열린 줄도 다음을 못 간다."}, {"face": "seal", "speaker": "급여리 전", "text": "월급은 남아 있고, 고리는 닫히지 않는다. 색 없는 집도 이 고리 안에서는 설 자리가 있다."}]}},
    17:{"intro": {"kicker": "열일곱째 장 · 빈 색", "title": "무색은 어디나 서고 돕지 않는다", "face": "seal", "hook": "색 없는 집은 어느 땅에나 선다. 어느 땅도 그 집을 돕지 않는다.", "pages": [{"face": "seal", "speaker": "공백리 무", "text": "전은 월급을 남기고 고리를 닫지 않았다. 나는 색이 없는 집이 어느 칸에 서는지를 본다."}, {"face": "seal", "speaker": "공백리 무", "text": "무색의 집은 불의 땅에도, 물의 땅에도, 바람과 대지의 땅에도 선다. 서 있어도 그 땅은 집을 도와주지 않는다."}]}, "outro": {"kicker": "열일곱째 장 · 이후", "title": "빈 색에는 보탬이 없다", "face": "seal", "pages": [{"face": "seal", "speaker": "공백리 무", "text": "결이 말한 집은 제 색 위에 서야 땅이 알아본다. 무색은 색을 가리지 않으나, 대신 땅의 보탬이 없다."}, {"face": "seal", "speaker": "공백리 무", "text": "나는 빈 색을 어느 칸에나 두되, 그 칸의 도움을 적지 않는다. 둘째 책의 다음 이름은 아직 비어 있다."}]}},
    18:{"intro": {"kicker": "열여덟째 장 · 열린 속표", "title": "다음 이름은 오지 않았다", "face": "seal", "hook": "둘째 책은 여전히 열려 있다. 다음 이름은 아직 도착하지 않았다.", "pages": [{"face": "seal", "speaker": "속표리 끝", "text": "무는 색 없는 집을 어디에나 세웠다. 나는 그 뒤에 올 이름이 속표에 앉았는지만 본다."}, {"face": "seal", "speaker": "속표리 끝", "text": "둘째 책은 덮이지 않았고, 다음 이름은 오지 않았다. 빈 줄은 한이 남겨 둔 그대로다."}]}, "outro": {"kicker": "열여덟째 장 · 이후", "title": "속표는 여기서 멈춘다", "face": "seal", "pages": [{"face": "seal", "speaker": "속표리 끝", "text": "월급은 남아 있고, 고리는 열려 있다. 나는 도착하지 않은 이름을 지어 넣지 않는다."}, {"face": "seal", "speaker": "속표리 끝", "text": "이 권은 아직 장부 밖에 있다. 다음 이름이 오기 전에는, 속표를 여기서 멈춘다."}]}}
  }
};


