/* global __dirname, Buffer */
/* Run after npm run build:web. Install Playwright or set PLAYWRIGHT_MODULE to its module path.
   All API/Google responses are fixtures; camera frames use Chromium's fake media device. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const report = [];
const output = path.resolve(__dirname, '../.test-results/web');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.join(root, pathname === '/' ? 'index.html' : pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (!path.extname(file)) file += '.html';
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  const types = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.ttf':'font/ttf' };
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
const profile = { language:'en', country:'US', schoolId:1, religiousCodes:['HALAL'], allergies:['EGG'], hasCompletedOnboarding:true };
const analysis = { analysisLogId:1, resultSource:'TEST', identifiedFoodKoreanName:'테스트 식사', identifiedFoodTranslationName:'Test meal', identifiedFoodPronunciationName:'test', identifiedFoodNameReason:'fixture', imageConfidence:0.95, spicyLevel:1, ingredients:['EGG'], allergies:['EGG'], matchedAllergies:['EGG'], matchedReligiousIngredients:[] };
let browser, lastPage;
async function fixture({ seed = true, corrupt = false, blocked = false, cameraError = '', delayedCamera = false, legacy = false } = {}) {
  const context = await browser.newContext({ viewport: {width:390,height:844}, permissions:['camera'] });
  let language = 'en', failSettings = false, failAccess = false, refreshes = 0;
  const uploads = [], errors = [], streams = [];
  await context.addInitScript(({seed, corrupt, blocked, cameraError, delayedCamera, legacy, profile}) => {
    if (seed && !sessionStorage.getItem('seeded')) {
      localStorage.setItem('accessToken','test-access'); localStorage.setItem('refreshToken','test-refresh');
      localStorage.setItem('app-storage-b', corrupt ? '{invalid-json' : JSON.stringify({state: legacy ? {...profile,religiousCodes:undefined,religiousCode:'HALAL'} : profile,version:legacy ? 5 : 6}));
      sessionStorage.setItem('seeded','yes');
    }
    if (blocked) for (const method of ['getItem','setItem','removeItem']) {
      const original = Storage.prototype[method];
      Storage.prototype[method] = function(...args) { if (this === localStorage) throw new DOMException('Blocked','SecurityError'); return original.apply(this,args); };
    }
    window.testStreams = [];
    const get = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async args => {
      if (cameraError) throw new DOMException('Test camera failure',cameraError);
      const result = await get(args);
      window.testStreams.push(result);
      if (delayedCamera) await new Promise(resolve => setTimeout(resolve,900));
      return result;
    };
  }, {seed,corrupt,blocked,cameraError,delayedCamera,legacy,profile});
  await context.route('https://accounts.google.com/gsi/client', route => route.fulfill({contentType:'application/javascript',body:`window.google={accounts:{id:{initialize(options){window.testLogin=options.callback},renderButton(el){const b=document.createElement('button');b.textContent='Mock Google login';b.onclick=()=>window.testLogin({credential:'fixture-id-token'});el.appendChild(b)}}}};`}));
  await context.route(/\/(api\/v1|auth)\//, async route => {
    const req = route.request(), url = new URL(req.url()), p = url.pathname;
    const json = (data,status=200) => route.fulfill({status,contentType:'application/json',body:JSON.stringify({success:true,data})});
    if(p.endsWith('/auth/login')) { assert.equal(req.postDataJSON().idToken,'fixture-id-token'); assert.match(req.postDataJSON().deviceId,/^[\da-f-]{36}$/); return json({accessToken:'test-access',refreshToken:'test-refresh',onboardingCompleted:true}); }
    if(p.endsWith('/auth/logout')) return json({});
    if(p.endsWith('/auth/refresh')) { refreshes++; assert.equal(req.postDataJSON().refreshToken,'test-refresh'); return json({accessToken:'renewed-access',refreshToken:'renewed-refresh'}); }
    if(failAccess && req.headers().authorization === 'Bearer test-access') return json({},401);
    if(p.includes('/settings/')) {
      if(failSettings) return json({},503);
      if(p.endsWith('/options/languages')) return json({languages:[{code:'en',name:'English',englishName:'English'},{code:'ko',name:'한국어',englishName:'한국어'}]});
      if(p.endsWith('/language')) { if(req.method() !== 'GET') language=req.postDataJSON().languageCode; return json({languageCode:language}); }
      if(p.endsWith('/country')) return json({countryCode:'US'});
      if(p.endsWith('/school')) return json({schoolId:1});
      if(p.endsWith('/religion')) return json({religiousCodes:['HALAL']});
      if(p.endsWith('/allergies')) return json({allergyCodes:['EGG']});
      return json({});
    }
    if(p.endsWith('/cafeterias')) return json({schoolId:1,cafeterias:[{cafeteriaId:1,name:'Test cafeteria'}]});
    if(p.endsWith('/weekly-meals')) return json({mealSchedules:[]});
    if(p.endsWith('/analyze-image')) {
      const body = req.postDataBuffer();
      assert.match(req.headers()['content-type'],/^multipart\/form-data; boundary=/);
      assert.match(body.toString('latin1'),/name="image"; filename="photo\.(jpg|png)"/);
      assert.ok(!body.includes(Buffer.from('[object Object]')));
      assert.ok(body.includes(Buffer.from([0xff,0xd8])) || body.includes(Buffer.from([0x89,0x50,0x4e,0x47])));
      uploads.push(body.length); return json(analysis);
    }
    return json({});
  });
  const page = await context.newPage(); lastPage = page;
  page.setDefaultTimeout(12000);

  page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});
  page.on('dialog',dialog=>dialog.accept());
  const url = `http://localhost:${server.address().port}`;
  return {context,page,url,uploads,errors,streams,setFailSettings:()=>{failSettings=true},setFailAccess:()=>{failAccess=true},refreshes:()=>refreshes};
}
async function check(name, work) { await work(); report.push({name,status:'PASS'}); console.log('PASS',name); }
async function videoReady(page) { await page.waitForFunction(()=>{const v=document.querySelector('video');return v?.readyState>=2 && v.videoWidth>0 && v.srcObject?.getVideoTracks()[0]?.readyState==='live'}); }
async function allStopped(page) { await page.waitForFunction(()=>window.testStreams.length>0 && window.testStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))); }
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser = await chromium.launch({channel:'chrome',headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 const f = await fixture({seed:false});
 await check('Google callback → API login → AsyncStorage token persistence',async()=>{
   await f.page.goto(f.url); await f.page.getByRole('button',{name:'Mock Google login'}).click();
   await f.page.waitForURL('**/main');
   assert.equal(await f.page.evaluate(()=>localStorage.getItem('accessToken')),'test-access');
 });
 await check('Menu pager selects dinner',async()=>{
   await f.page.getByText('Dinner',{exact:true}).click();
   assert.equal(await f.page.getByText('Dinner',{exact:true}).evaluate(el => getComputedStyle(el).fontWeight),'700');
   assert.deepEqual(f.errors,[]);
 });
 await check('Profile editing + reload restores AsyncStorage without server settings',async()=>{
   await f.page.goto(f.url+'/settings/language');
   const saved = f.page.waitForResponse(r => r.url().endsWith('/settings/language') && r.request().method()==='PATCH' && r.ok());
   await f.page.getByText('한국어',{exact:true}).click(); await saved;
   await f.page.waitForFunction(()=>JSON.parse(localStorage.getItem('app-storage-b')).state.language==='ko');
   f.setFailSettings(); await f.page.reload(); await f.page.getByText('언어 설정',{exact:true}).waitFor();
   assert.equal(await f.page.evaluate(()=>JSON.parse(localStorage.getItem('app-storage-b')).state.language),'ko');
 });
 await f.context.close();
 const c = await fixture();
 await check('Scan tab starts live video; flip releases previous camera',async()=>{
   await c.page.goto(c.url+'/main'); await c.page.getByRole('tab',{name:/Scan/}).click(); await videoReady(c.page);
   await c.page.getByRole('button',{name:'Flip camera',exact:true}).click(); await videoReady(c.page);
   await c.page.waitForFunction(()=>window.testStreams.length>=2 && window.testStreams[0].getTracks().every(t=>t.readyState==='ended'));
 });
 await check('Capture sends multipart image bytes and opens result; stream stops',async()=>{
   await c.page.getByRole('button',{name:'Capture',exact:true}).click(); await c.page.waitForURL('**/scan-result');
   await c.page.getByText('Test meal 🌶️',{exact:true}).waitFor(); assert.equal(c.uploads.length,1); await allStopped(c.page);
   await c.page.screenshot({path:path.join(output,'web-scan-result.png')});
 });
 await check('Back resumes camera; menu tab stops it; scan re-entry resumes',async()=>{
   await c.page.goBack(); await videoReady(c.page);
   await c.page.getByRole('tab',{name:/Menu/}).click(); await allStopped(c.page);
   await c.page.getByRole('tab',{name:/Scan/}).click(); await videoReady(c.page);
   await c.page.screenshot({path:path.join(output,'web-camera.png')});
 });
 await check('401 refresh persists rotated tokens; logout removes both; reload stays signed out',async()=>{
   c.setFailAccess(); await c.page.goto(c.url+'/settings');
   await c.page.waitForFunction(()=>localStorage.getItem('accessToken')==='renewed-access');
   assert.equal(c.refreshes(),1); assert.equal(await c.page.evaluate(()=>localStorage.getItem('refreshToken')),'renewed-refresh');
   await c.page.getByText('Log Out',{exact:true}).click(); await c.page.waitForURL(c.url+'/');
   assert.deepEqual(await c.page.evaluate(()=>[localStorage.getItem('accessToken'),localStorage.getItem('refreshToken')]),[null,null]);
   await c.page.reload(); await c.page.getByRole('button',{name:'Mock Google login'}).waitFor(); assert.deepEqual(c.errors,[]);
 });
 await c.context.close();
 for(const [name,opts] of [['Corrupt persisted JSON does not stall startup',{corrupt:true}],['Blocked localStorage does not stall login',{blocked:true}],['Legacy v5 preferences migrate to v6',{legacy:true}]]) {
   await check(name,async()=>{
     const x=await fixture(opts); if(opts.legacy) x.setFailSettings(); await x.page.goto(x.url);
     if(opts.corrupt) await x.page.waitForURL('**/onboarding/language');
     else if(opts.blocked) await x.page.getByRole('button',{name:'Mock Google login'}).waitFor();
     else { await x.page.waitForURL('**/main'); assert.deepEqual(await x.page.evaluate(()=>JSON.parse(localStorage.getItem('app-storage-b')).state.religiousCodes),['HALAL']); }
     assert.deepEqual(x.errors,[]); await x.context.close();
   });
 }
 for(const error of ['NotAllowedError','NotFoundError']) {
   await check(`${error}: visible error + disabled capture + gallery upload`,async()=>{
     const x=await fixture({cameraError:error}); await x.page.goto(x.url+'/camera'); await x.page.getByRole('button',{name:'Retry camera'}).waitFor();
     assert.equal(await x.page.getByRole('button',{name:'Capture',exact:true}).isDisabled(),true);
     const chooser=x.page.waitForEvent('filechooser'); await x.page.getByRole('button',{name:'Pick from gallery'}).click();
     await (await chooser).setFiles({name:'sample.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jF1sAAAAASUVORK5CYII=','base64')});
     await x.page.waitForURL('**/scan-result'); assert.equal(x.uploads.length,1); assert.deepEqual(x.errors,[]); await x.context.close();
   });
 }
 await check('Permission resolving after tab exit does not leak a live camera',async()=>{
   const x=await fixture({delayedCamera:true}); await x.page.goto(x.url+'/camera'); await x.page.waitForFunction(()=>window.testStreams.length>0);
   await x.page.getByRole('tab',{name:/Menu/}).click(); await allStopped(x.page); assert.deepEqual(x.errors,[]); await x.context.close();
 });
 console.log(JSON.stringify(report,null,2));
})().catch(async e=>{console.error(e); console.log(await lastPage?.locator('body').innerText()); await lastPage?.screenshot({path:path.join(output,'failure.png')});process.exitCode=1}).finally(async()=>{
 fs.writeFileSync(path.join(output,'web-test-results.json'),JSON.stringify(report,null,2)+'\n');
 await browser?.close(); server.close();
});
