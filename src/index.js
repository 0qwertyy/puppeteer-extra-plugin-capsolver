'use strict';
const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin');
const CapSolver = require('../../capsolver-npm/src/CapSolver');
const { createCursor } = require("ghost-cursor");
const axios = require("axios");

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * capsolver.com Puppeteer Plugin:
 * Integrates capsolver-npm (api wrapper) & adds extra captcha DOM features
 */
class CapSolverPlugin extends PuppeteerExtraPlugin {
    constructor(opts = { }) { super(opts); }

    get name() { return 'capsolver-plugin'; }

    get defaults() { return { }; }

    /** Initialize **/
    async onPluginRegistered(){ if(this.opts.handler && this.opts.handler.verbose !== 0) { console.log('[CapSolverPlugin] Plugin registered'); } }

    /**
     * @param {Target} target - PuppeteerTarget
     */
    async onTargetChanged(target) { if(this.opts.handler && this.opts.handler.verbose === 2) { console.log('[CapSolverPlugin][Target changed]['+JSON.stringify(target)+']'); } }

    /**
     * Set new capsolver.com API task handler instance.
     *
     * @param {string} apikey - personal apikey in capsolver.com API
     * @param {number} verbose - (0/1/2) verbose level for task outputs
     */
    setHandler(apikey, verbose=0){ this.opts.handler = new CapSolver(apikey, verbose, 500); this.opts.verbose = verbose; return this; }

    /**
     * Returns capsolver.com API task handler instance.
     *
     */
    handler(){ return this.opts.handler; }

    /**
     * hcaptcha classification task + captcha image click & submit
     *
     * @param {object} page - Puppeter Page
     * @param {boolean} retry - Retry if failed
     */
    async hcaptchaclicker(page, retry=true){
        if(this.opts.handler === undefined) throw 'No existing handler for CapSolverPlugin. Please, set it and add your apiKey with: `CapSolverPlugin.setHandler("apikey");`.'

        const self = this;

        let cursor; let frame;
        let second = false;

        async function trigger(){
            await page.waitForSelector('iframe');
            await page.waitForTimeout(200);
            cursor = null; cursor = createCursor(page);
            await cursor.click('iframe');
            await page.waitForTimeout(750);
            frame = await page.frames().find(x => x.url().includes("https://newassets.hcaptcha.com"));
            if(frame === undefined){ if(self.opts.handler.verbose !== 0){ console.log('[CapSolverPlugin][Triggering...]'); } await trigger(); }
        }

        async function solve(){
            await frame.waitForSelector('.crumb-bg', {timeout: 1000}).catch(e => { second = false }).then(e =>{ second = e !== undefined });
            await page.waitForTimeout(1200);
            cursor = null;
            cursor = createCursor(page);
            await frame.waitForSelector('.language-selector');
            await frame.click('.language-selector');

            const [lang] = await frame.$x("//span[contains(text(), 'English')]");
            if (lang) { await lang.click().catch(e => console.log('[CapSolverPlugin][Could not change translate to english! Original question assigned.]')); }

            const qElement = await frame.$('.prompt-text');
            const question = await frame.evaluate(el => el.textContent, qElement);

            let base64 = [];
            for (let i = 0; i < 9; i++) {
                await frame.waitForSelector(`div.task-image:nth-child(${i + 1}) > div:nth-child(2) > div:nth-child(1)`, { visible: true });
                await frame.waitForFunction((i) => document.querySelector(`div.task-image:nth-child(${i + 1}) > div:nth-child(2) > div:nth-child(1)`)?.getAttribute("style")?.indexOf("url(") !== -1, {}, i);
                const elementHandle = await frame.$(`div.task-image:nth-child(${i + 1}) > div:nth-child(2) > div:nth-child(1)`);
                const style = await frame.evaluate((el) => el.getAttribute('style'), elementHandle);
                const url = await style.split('url("')[1].split('")')[0];
                await axios.get(url, { responseType: 'arraybuffer' }).then(response => {
                    base64.push(Buffer.from(response.data, 'binary').toString('base64'));
                });
            }

            // handle capsolver.com image classification service - receiving boolean array
            let capsolver = await self.opts.handler.hcaptchaclassification(question, base64, false);
            await frame.waitForTimeout(200);
            let coords;

            if(parseInt(capsolver.error) === 0){
                coords = capsolver.apiResponse.solution.objects;
            }else{
                if(capsolver.apiResponse.errorId !== 0){ throw ('capsolver API invalid task: '+JSON.stringify(capsolver.apiResponse)); }
                else{ coords = capsolver.apiResponse.solution.objects; }
            }

            for (const [i, isImage] of coords.entries()) { if(isImage) { await frame.click(`div.task-image:nth-child(${i + 1})`); if(self.opts.handler.verbose !== 0){ console.log('[CapSolverPlugin][Clicked! '+(i+1)+']'); } } await sleep(Math.floor(Math.random() * (600 - 100) + 100)); }
            await frame.waitForTimeout(200);
            let submitbtn = await frame.$('.button-submit.button');
            await submitbtn.evaluate(b => { b.click(); })
            await page.waitForTimeout(1200);

            const tryagain = await frame.$eval('.display-error', e => { return e.getAttribute('aria-hidden') });   // false = Try again prompt displayed
            if(tryagain === "false"){ if(retry === true){ if(self.opts.handler.verbose !== 0){ console.log('[CapSolverPlugin][Re-trying...]'); } await solve(); }else{ throw('Try again'); } }
        }

        try{
            await page.waitForSelector('iframe');
            await trigger();    // get frame
            if (frame != null) {
                await frame.waitForSelector('div.hcaptcha-logo').catch(e => { throw(1); }).then(e =>{ });
                await solve();
                if(second === true) {
                    if(self.opts.handler.verbose !== 0){ console.log('[CapSolverPlugin][2-step HCaptcha detected]'); }
                    await frame.waitForTimeout(200);
                    await solve();
                }
            }else{ throw(1); }
        }catch (e){ console.log(e); throw('HCaptcha inaccessible.'); }
        return page;
    }
}

/** Default export, CapSolverPlugin */
const defaultExport = opts => new CapSolverPlugin(opts);
module.exports = defaultExport;