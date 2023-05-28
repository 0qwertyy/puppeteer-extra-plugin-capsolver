# puppeteer-extra-plugin-capsolver
[![](https://img.shields.io/badge/1.1.2-puppeteer--extra--plugin--capsolver-darkgreen?logo=npm&logoColor=white)](https://www.npmjs.com/package/puppeteer-extra-plugin-capsolver)
[![](https://img.shields.io/badge/documentation-docs.capsolver.com-darkgreen)](https://docs.capsolver.com/guide/getting-started.html)

- **Manage to solve captcha challenges with AI (captcha service based).**
- **Puppeteer browser context.**
- ❗ An API key it's **required**. [**Get here.**](https://dashboard.capsolver.com/passport/register?inviteCode=CHhA_5os)
---

⬇️ Install
-
    npm i puppeteer puppeteer-extra puppeteer-extra-plugin-capsolver

✋ Usage
-
Import and use within [`puppeteer-extra`](https://github.com/berstend/puppeteer-extra).

```javascript 
const puppeteer = require('puppeteer-extra')
const CapSolverPlugin = require('puppeteer-extra-plugin-capsolver')({
    apiKey: 'CAI-XXX ...',
    verboseLevel: 1,
    retry: true         // hcaptchaclicker: by default will retry challenges 
})
puppeteer.use(CapSolverPlugin)
 ```

# 🖱 HCaptcha (DOM feature)
![](https://raw.githubusercontent.com/0qwertyy/puppeteer-extra-plugin-capsolver/master/examples/puppeteer.gif)

- **`await page.hcaptchaclicker(checkboxFrame=undefined)`**  - handle a page including hcaptcha checkbox iframe *[example script (how to use).](https://github.com/0qwertyy/puppeteer-extra-plugin-capsolver/blob/master/examples/hcaptchaclicker-multiple-demo.js)*

- Will detect for failed callenges (and retry) and for double challenges that sometimes appears.

- Catch `.hcaptchaclicker()` exceptions for unsupported challenges.
- Read more about recognize captcha images through [HCaptcha Image Classification](https://docs.capsolver.com/guide/recognition/HCaptchaClassification.html).

```javascript
// get custom hcatpcha checkbox iframe
const desiredCheckboxFrame = await page.$("iframe[src*='custom-link-for-iframe-selector']")

await page.hcaptchaclicker(desiredCheckboxFrame) // pass no frame for detect the first on the page
.then(async (page) => {
    // submit if passed the challenge
    await page.click('#submit-my-form')
    await page.waitForNavigation()
}).catch((e) => {
    // ! catch clicker exception
    console.log(e)
})
```

📖 Handler / Solving Tasks API Wrapper
-

- **Based on [capsolver-npm](https://github.com/0qwertyy/capsolver-npm) (nodejs api wrapper for capsolver.com api).**
- **Handler it's attached to any puppeteer page.**

- Use the handler with:
```javascript
await page.capsolver()
```
- Perform any task that `capsolver-npm` brings.
- Supported captcha tasks listed on capsolver-npm at [*capsolver-npm#Supported API methods*](https://github.com/0qwertyy/capsolver-npm#-supported-captcha-tasks).

*example: retrieve handler and call for funcaptcha token.*
```javascript
await page.capsolver()
    .funcaptchaproxyless(websiteURL, websitePublicKey, funcaptchaApiJSSubdomain) // see required parametes by https://github.com/0qwertyy/capsolver-npm#-supported-captcha-tasks
    .then((results) => {
        if (results.error !== 0) {
            // createTask solution
            const token = results.solution
        } else {
            console.log(`got an error! ${JSON.stringify(results.apiResponse)}`)
        }
    }).catch(e => {
        console.log(e)
    })
```

- **Note that `await page.capsolver().runAnyTask({})` it's also supported in the case of tasks that are not supported by task-bind methods.**
  ***see: [examples/run-any-task-example.js](https://github.com/0qwertyy/puppeteer-extra-plugin-capsolver/blob/master/examples/solve-tasks/run-any-task-example.js)***

📁 Working Examples
-
figure out at [examples](https://github.com/0qwertyy/puppeteer-extra-plugin-capsolver/blob/master/examples/) directory
