const puppeteer = require('puppeteer-extra')
const { executablePath } = require('puppeteer')
const CapSolverPlugin = require('../src/index')({
    apiKey: 'CAI-XXX ...',
    verboseLevel: 1,
    retry: true    // works for .hcaptchaclicker()
})

puppeteer.use(CapSolverPlugin)


/** MAIN / SCRIPT  */
let targeturl = 'https://nopecha.com/demo/hcaptcha'

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

    // run one clicker for each widget
    await page.hcaptchaclicker(captchaCheckboxFrames[1]).catch(e => { console.log(`Error solving a captcha: ${e}`) })

    await page.hcaptchaclicker(captchaCheckboxFrames[3]).catch(e => { console.log(`Error solving a captcha: ${e}`) })

    await page.hcaptchaclicker(captchaCheckboxFrames[2]).catch(e => { console.log(`Error solving a captcha: ${e}`) })

    await page.hcaptchaclicker(captchaCheckboxFrames[0]).catch(e => { console.log(`Error solving a captcha: ${e}`) })

    console.log(`[myapp][finished]`)
})