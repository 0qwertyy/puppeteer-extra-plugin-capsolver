const puppeteer = require('puppeteer-extra');
const { executablePath } = require('puppeteer');
const CapSolverPlugin = require('../src/index')(); // ! Initialize once with ()

puppeteer.use(CapSolverPlugin);
CapSolverPlugin.setHandler('CAI-B1AEB984E64D3E617ADE2A4BF09D43F4', 2);

/** MAIN / SCRIPT  */

let targeturl = 'https://accounts.hcaptcha.com/demo';

puppeteer.launch({
    headless: false, executablePath: executablePath(),
})
.then(async browser => {
    await browser.createIncognitoBrowserContext();
    let page = await browser.newPage();
    await page.goto(targeturl);
    console.log('[myapp][navigate][' + targeturl + ']');

    //
    // build your own script here ...
    //

    // ! executes clicker
    console.log('[myapp][executing HCaptcha clicker over page: '+JSON.stringify(page)+']');
    await CapSolverPlugin.hcaptchaclicker(page)
    .then(async (page) => {
        // submit if passed captcha
        await page.click('#hcaptcha-demo-submit');
        await page.waitForNavigation();
    }).catch((e) => {
        // print clicker error
        console.log(e);
    });

})