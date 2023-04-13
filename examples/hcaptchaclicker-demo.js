const puppeteer = require('puppeteer-extra')
const { executablePath } = require('puppeteer')
const CapSolverPlugin = require('../src/index')({
    apiKey: 'CAI-XXX ...',
    verboseLevel: 1,
    retry: false    // works for .hcaptchaclicker()
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
    const captchaCheckboxFrames = await page.$$('iframe[title*="containing checkbox for hCaptcha"]')
    console.log(`[myapp][found ${captchaCheckboxFrames.length} hcaptcha frames]`)

    // search for the first hcaptcha frame
    await page.hcaptchaclicker().catch(e => { console.log(e) })

    console.log(`[myapp][finished]`)
})