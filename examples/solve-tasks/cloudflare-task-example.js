const puppeteer = require('puppeteer-extra')
const { executablePath } = require('puppeteer')
const CapSolverPlugin = require('../../src')({
    apiKey: 'CAI-XXX ...',
    verboseLevel: 1
})

puppeteer.use(CapSolverPlugin)


/** MAIN / SCRIPT  */
let targeturl = 'https://chat.openai.com/chat'
let proxystring = 'proxy.provider.io:23331:user1:password1'

puppeteer.launch({
    headless: false, executablePath: executablePath(),
})
    .then(async browser => {
        await browser.createIncognitoBrowserContext()
        let page = await browser.newPage()

        console.log(`[myapp][navigating][${targeturl}]`)
        await page.goto(targeturl)

        await page.capsolver().anticloudflare(
            targeturl,
            {'proxy': proxystring},
            {'type': 'challenge'}  // challenge/turnstile (2 differents clodflare types are compatible. refer to https://docs.capsolver.com/)
        ).then(async (results) => {
            if (results.error === 0) {
                const solution = results.solution
                console.log(`[myapp][cloudflare solved]`)
                console.log(solution)
            }

            //
            //
            // ... custom script with the solution

        }).catch(e => {
            console.log(e)
        })

        console.log(`[myapp][finished]`)
    })