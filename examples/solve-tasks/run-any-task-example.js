const puppeteer = require('puppeteer-extra')
const { executablePath } = require('puppeteer')
const CapSolverPlugin = require('../../src')({
    apiKey: 'CAI-6AC8DDA7D69277DBB7F3F664C65D056E',
    verboseLevel: 1
})

puppeteer.use(CapSolverPlugin)


/** MAIN / SCRIPT  */
let targeturl = 'https://accounts.hcaptcha.com/demo'

puppeteer.launch({
    headless: false, executablePath: executablePath(),
})
    .then(async browser => {
        await browser.createIncognitoBrowserContext()
        let page = await browser.newPage()

        console.log(`[myapp][navigating][${targeturl}]`)
        await page.goto(targeturl)

        await page.waitForTimeout(2000)

        await page.capsolver().runAnyTask({
            type: 'HCaptchaTaskProxyLess',      // run any capsolver task with it's schema. see https://docs.capsolver.com/
            websiteURL: targeturl,
            websiteKey: '00000000-0000-0000-0000-000000000000',
            // proxyInfo: { 'proxy' : 'proxy.provider.io:23331:user1:password1' } // use for proxy required tasks
        }).then(async (results) => {
            const solution = results.solution

            console.log(`[myapp][hcaptcha solved]`)
            console.log(`[myapp][${solution['captchaKey']}]`)

            //
            //
            // ... use the solution

        }).catch(e => {
            console.log(e)
        })

        console.log(`[myapp][finished]`)
    })