const puppeteer = require('puppeteer-extra');
const {executablePath} = require('puppeteer');
const CapSolverPlugin = require('../../src/index')(); // ! Initialize once with ()

puppeteer.use(CapSolverPlugin);
CapSolverPlugin.setHandler('CAI-B1AEB984E64D3E617ADE2A4BF09D43F4');

/** METHODS  */

/** @args PuppeteerPage page  */
async function fill(page) {
    const emailbox = 'input[name="email"]';
    await page.waitForSelector(emailbox);
    await page.click(emailbox);
    await page.type(emailbox, email);

    const usernamebox = 'input[name="username"]';
    await page.click(usernamebox);
    await page.type(usernamebox, username);

    const passwordbox = 'input[type="password"]';
    await page.click(passwordbox);
    await page.type(passwordbox, password);

    const termsagreebox = 'input[type="checkbox"]';
    await page.waitForSelector(termsagreebox);
    await page.click(termsagreebox);

    const monthbox = 'div[class^=month-]';
    await page.click(monthbox);
    await page.$eval(monthbox, () => {
        document.querySelector('div[class^=month-]')
            .children[0].children[0]
            .children[0].children[2]
            .children[0].children[Math.floor(Math.random() * (12 - 1) + 1)].click()
    });

    const daybox = 'input#react-select-3-input';
    await page.click(daybox);
    await page.type(daybox, String(Math.floor(Math.random() * (30 - 1) + 1)));

    const yearbox = 'input#react-select-4-input';
    await page.click(yearbox);
    await page.type(yearbox, String(1980));
}

/** @args PuppeteerPage page  */
async function solveAndSubmit(page) {
    // # step 1: wait to obtain valid token with capsolver.com
    const result = await CapSolverPlugin.handler().hcaptchaproxyless(discordUrl, discordSitekey);

    if (result.error !== 0) {
        throw result.apiResponse;
    } else {
        let token = String(result.solution.gRecaptchaResponse);

        // # step 2: join hcaptcha token into html
        await page.evaluate((token) => {
            document.querySelector('iframe').setAttribute('data-hcaptcha-response', token);
        }, token);

        // # step 3: trigger hcaptcha callback function (discord version)
        await page.evaluate((token) => {
            const fixed = "__reactProp";

            // search "__reactProp" starts with property
            const captchaParent = document.querySelector('iframe').parentElement.parentElement;
            const parentProperties = Object.keys(captchaParent);
            const variable = parentProperties.filter(prop => prop.includes(fixed))[0];

            // force "onVerify" execution passing token
            document.querySelector('iframe').parentElement.parentElement[variable].children.props.onVerify(token);
        }, token);
    }

}


/** MAIN / SCRIPT */
const discordUrl = 'https://discord.com/register';
const discordSitekey = '4c672d35-0701-42b2-88c3-78380b0db560';

const domain = '@domain.net';
let email, username, password;

puppeteer.launch({
    headless: false, executablePath: executablePath()
}).then(async browser => {

    username = 'username1234' + Math.floor(Math.random() * 100);
    email = username + domain;
    password = 'default00#';

    try {
        await browser.createIncognitoBrowserContext();
        let page = await browser.newPage();

        console.log('[myapp][going to ' + discordUrl + ']');
        await page.goto(discordUrl);

        // fill all register form
        await fill(page);

        // submit register form
        await page.click('button[type="submit"]');

        // ! check ip rate limit by discord
        await page.waitForTimeout(5000);
        const blocked = await page.$eval('body', (e) => {
            return e.innerHTML.includes('rate limited');
        })

        if(blocked){
            console.log('[myapp] [❌][' + email + '][?banned ip]');
            process.exit(1);
        }

        // solve hcaptcha iframe challenge
        await page.waitForSelector('iframe');
        await solveAndSubmit(page);

        // response html text
        await page.waitForNavigation();
        let htmldata1 = await page.$eval('body', (body) => {
            return body.innerHTML;
        });
        console.log(htmldata1);

    } catch (e) {
        await browser.close();
        console.log('[myapp] [❌][failed! ' + email + ']');
        console.log(e);
    }
})

