const puppeteer = require('puppeteer');
const fs = require('fs');
(async ()=>{
  const url = process.env.URL || 'http://127.0.0.1:8080/eventhub/';
  console.log('Opening', url);
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  try{
    await page.goto(url, {waitUntil: 'networkidle2', timeout: 15000});
    await page.waitForSelector('.events-grid', {timeout:5000});
    const hasLogo = await page.$eval('.logo img', el => !!el && el.src);
    console.log('Found logo src:', hasLogo);
    await page.screenshot({path: 'tmp/eventhub_smoke.png', fullPage: true});
    console.log('Screenshot saved to tmp/eventhub_smoke.png');
    await browser.close();
    process.exit(0);
  }catch(err){
    console.error('Smoke test failed:', err);
    await page.screenshot({path: 'tmp/eventhub_smoke_failed.png', fullPage: true}).catch(()=>{});
    await browser.close();
    process.exit(2);
  }
})();
