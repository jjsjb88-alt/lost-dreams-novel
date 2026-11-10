import test from 'node:test';
import assert from 'node:assert/strict';
import {parseNeuralLedger} from './neural-stage.js';
test('structured neural ledger preserves actual decimals, signs, punctuation and whitespace',()=>{
 for(const text of ['수면 7시간 11분. 신체 회복률 98.2%. 광고 적합도 94.8%. 정산 예정 +12.4 TOKEN.','기본 광고 +8.1 TOKEN.\n감정 몰입 +3.4 TOKEN.','  예상 비용 940만 TOKEN.\r\n 잔액 -4.2 TOKEN.']){
  const fields=parseNeuralLedger(text);assert.ok(fields?.length>=2);
  assert.equal(fields.map(x=>x.label+x.value+x.separator).join(''),text);
 }
 assert.ok(parseNeuralLedger('회복 98.2%. 보상 +12.4 TOKEN.').some(x=>x.value==='98.2%.'));
});
test('ambiguous narration and nonnumeric claims are not forced into a numeric interface',()=>{
 for(const text of ['한 번 생각했다. 두 번째는 없었다.','대기 12번. 아무도 오지 않았다.','이미 끝난 기록','잔액 7.1 TOKEN.'])assert.equal(parseNeuralLedger(text),null);
});
