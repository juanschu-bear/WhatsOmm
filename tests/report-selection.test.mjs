import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadStoredReport } from '../lib/report-selection.ts'
const cid='3b05fb89-7ca3-48a5-ad0b-cbf029ba1f1a', rid='3067bb99-0661-4158-9693-92a586ea718d'
function fake(rows, error=null) {
 const filters=[];let limit;let orders=[]
 const q={select(){return q},eq(k,v){filters.push([k,v]);return q},order(k){orders.push(k);return q},limit(n){limit=n;return q},async maybeSingle(){let result=rows.filter(r=>filters.every(([k,v])=>r[k]===v));if(orders.length)result.sort((a,b)=>b.created_at.localeCompare(a.created_at));if(limit)result=result.slice(0,limit);return {data:result[0]??null,error:error??(result.length>1?new Error('multiple'):null)}}}
 return {from(){return q}}
}
const rows=[{id:rid,conversation_id:cid,created_at:'2026-11-12',report:{date:'older'}},{id:'7066a821-d446-4a87-8309-b13cb5da1b76',conversation_id:cid,created_at:'2026-11-13',report:{date:'newer'}}]
test('selects the clicked report even if a newer call exists',async()=>assert.equal((await loadStoredReport(fake(rows),cid,rid)).date,'older'))
test('legacy conversation links tolerate multiple reports',async()=>assert.equal((await loadStoredReport(fake(rows),cid)).date,'newer'))
test('report ID cannot select another conversation',async()=>assert.equal(await loadStoredReport(fake(rows),'11111111-1111-1111-1111-111111111111',rid),null))
test('missing report does not substitute another report',async()=>assert.equal(await loadStoredReport(fake(rows),cid,'11111111-1111-1111-1111-111111111111'),null))
test('database errors stay errors rather than sample content',async()=>assert.rejects(loadStoredReport(fake([],new Error('offline')),cid)))
