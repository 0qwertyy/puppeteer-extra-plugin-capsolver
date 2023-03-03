# puppeteer-extra-plugin-capsolver
[![](https://img.shields.io/badge/1.0.2-puppeteer--extra--plugin--capsolver-darkgreen?logo=npm&logoColor=white)](https://www.npmjs.com/package/puppeteer-extra-plugin-capsolver)
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
1. Import and use within [`puppeteer-extra`](https://github.com/berstend/puppeteer-extra).

```javascript 
 const puppeteer = require('puppeteer-extra');
 const CapSolverPlugin = require('puppeteer-extra-plugin-capsolver')();
    
 puppeteer.use(CapSolverPlugin);
 ```

2. Initialize handler with you API key at the top of your script.


```javascript 
CapSolverPlugin.setHandler('CAI-XXX ...', 1); // 1 or 2 enable debug level
```


📖 Handler / Solving API Wrapper
-

- **Handler it's based on [capsolver-npm](https://github.com/0qwertyy/capsolver-npm) (nodejs api wrapper for capsolver.com api).**

- Retrieve the currently handler:
```javascript
const handler = CapSolverPlugin.handler()
```
- Perform any task that `capsolver-npm` brings.
- Supported captcha tasks listed on capsolver-npm at [*Supported API methods*](https://github.com/0qwertyy/capsolver-npm#-supported-captcha-tasks).

*example: retrieve handler and call for funcaptcha token.*
```javascript
//  
await CapSolverPlugin.handler()
  .funcaptchaproxyless(websiteURL, websitePublicKey, funcaptchaApiJSSubdomain)
  .then((response) => {
    if(response.error !== 0){ 
        // FunCaptcha token!
        const token = response.solution;    
    }else{
        console.log('[myapp][task failed]' + JSON.stringify(response.apiResponse))
    }  
  });
```


# 🖱 HCaptcha Clicker (a DOM feature)

![](https://raw.githubusercontent.com/0qwertyy/puppeteer-extra-plugin-capsolver/master/examples/puppeteer.gif)

- **`await CapSolverPlugin.hcaptchaclicker(page)`**  - handle a page including hcaptcha iframe and trigger it, then emulates human clicks. *[example script (how to use).](https://github.com/0qwertyy/puppeteer-extra-plugin-capsolver/blob/master/examples/hcaptchaclicker.js)*

- Will auto-detect if fails the callenge (retry) and double challenges hcaptcha that sometimes appears.

- See how recognize images captcha images through [HCaptcha Image Classification](https://docs.capsolver.com/guide/recognition/HCaptchaClassification.html).

```javascript
// receives PuppeterPage instance
await CapSolverPlugin.hcaptchaclicker(page)
.then(async (page) => {
    // submit if passed captcha
    await page.click('#hcaptcha-demo-submit');
    await page.waitForNavigation();
}).catch((e) => {
    // print clicker error
    console.log(e);
});
```


📁 Working Examples
-

figure out at [examples](https://github.com/0qwertyy/puppeteer-extra-plugin-capsolver/blob/master/examples/) directory
