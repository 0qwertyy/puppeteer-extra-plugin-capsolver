const puppeteer = require('puppeteer-extra')
const { executablePath } = require('puppeteer')
const CapSolverPlugin = require('../../src')({
    apiKey: 'CAI-XXX ...',
    verboseLevel: 1
})

puppeteer.use(CapSolverPlugin)

/** METHODS  */

/** @args PuppeteerPage page  */
async function fill(page) {
    const emailbox = 'input[name="email"]'
    await page.waitForSelector(emailbox)
    await page.click(emailbox)
    await page.type(emailbox, email)

    const usernamebox = 'input[name="username"]'
    await page.click(usernamebox)
    await page.type(usernamebox, username)

    const passwordbox = 'input[type="password"]'
    await page.click(passwordbox)
    await page.type(passwordbox, password)

    const termsagreebox = 'input[type="checkbox"]'
    await page.waitForSelector(termsagreebox)
    await page.click(termsagreebox)

    const monthbox = 'div[class^=month-]'
    await page.click(monthbox)
    await page.$eval(monthbox, () => {
        document.querySelector('div[class^=month-]')
            .children[0].children[0]
            .children[0].children[2]
            .children[0].children[Math.floor(Math.random() * (12 - 1) + 1)].click()
    })

    const daybox = 'input#react-select-3-input'
    await page.click(daybox)
    await page.type(daybox, String(Math.floor(Math.random() * (30 - 1) + 1)))

    const yearbox = 'input#react-select-4-input'
    await page.click(yearbox)
    await page.type(yearbox, String(1980))
}


/** MAIN / SCRIPT */
const discordUrl = 'https://discord.com/register'

const domain = '@domain.net'
let email, username, password

puppeteer.launch({
    headless: false, executablePath: executablePath()
}).then(async browser => {

    username = 'username1234' + Math.floor(Math.random() * 100)
    email = username + domain
    password = 'default00#'

    try {
        await browser.createIncognitoBrowserContext()
        let page = await browser.newPage()

        console.log('[myapp][going to ' + discordUrl + ']')
        await page.goto(discordUrl)

        // fill all register form
        await fill(page)

        // submit register form
        await page.click('button[type="submit"]')

        // ! check ip rate limit by discord
        await page.waitForTimeout(5000)
        const blocked = await page.$eval('body', (e) => {
            return e.innerHTML.includes('rate limited')
        })

        if(blocked){
            console.log('[myapp] [❌][' + email + '][rate limited]')
            process.exit(1)
        }

        // force a delay in discord in order to wait captcha load properly
        // delay will depends on your connection speed
        console.log(`[myapp][forced delay of 20000ms]`)
        await page.waitForTimeout(20000)

        // simply executes function and use catch to see exceptions
        console.log(`[myapp][executing HCaptcha clicker over page: ${await page.title()}]`)
        await page.hcaptchaclicker().catch(e => {
            console.log(e)
        })

        // evaluate response html if success
        await page.waitForNavigation()
        let htmldata1 = await page.$eval('body', (body) => {
            return body.innerHTML
        })
        console.log(htmldata1)

    } catch (e) {
        await browser.close()
        console.log('[myapp] [❌][failed! ' + email + ']')
        console.log(e)
    }
})

