const axios = require('axios')
const {sleep} = require('../functions')

/** IMAGES GRID CHALLENGE RELATED */
async function _getCapsolverPayload(bodyElement) {
    // obtain question string
    const qElement = await bodyElement.$('.prompt-text')
    const question = await qElement.evaluate(el => el.textContent, qElement)

    // obtain base64 encoded images array
    let base64 = []
    for (let i = 0; i < 9; i++) {
        await bodyElement.waitForSelector(`div.task-image:nth-child(${i + 1}) > div:nth-child(2) > div:nth-child(1)`, {visible: true})
        const styleString = await bodyElement.$eval(`div.task-image:nth-child(${i + 1}) > div:nth-child(2) > div:nth-child(1)`, (el) => {
            return el.getAttribute('style')
        })
        const base64Image = await styleString.split('url("')[1].split('")')[0]
        await axios.get(base64Image, {responseType: 'arraybuffer'}).then(response => {
            base64.push(Buffer.from(response.data, 'binary').toString('base64'))
        })
    }

    return [question, base64]
}

async function _imageGridClicker(page, opts, captchaFrame = undefined) {
    let twoStepCaptcha = false

    async function solve(captchaFrame) {
        const body = await captchaFrame.$('body')

        // evaluate if it's a 2-step hcaptcha
        await body.waitForSelector('.crumbs-wrapper', {timeout: 1200})
            .then(async e => {
                const crumbsLength = await e.$$eval('div div.crumb-bg', (e) => {
                    return e.length
                })
                twoStepCaptcha = (crumbsLength === 2)
            })
            .catch(e => {
                twoStepCaptcha = false
            })

        await _switchLanguage(body, opts)

        let [question, base64] = await _getCapsolverPayload(body)

        // handle capsolver.com image classification service - receiving boolean array
        let capsolver = await opts.handler.hcaptchaclassification(question, base64)
        let coords

        if (capsolver.error === 0) {
            coords = capsolver.apiResponse.solution.objects
        } else {
            if (capsolver.apiResponse.errorId !== 0) {
                throw `puppeteer-extra-plugin-capsolver: (ERROR) Solving API response: (${JSON.stringify(capsolver.apiResponse)}`
            } else {
                coords = capsolver.apiResponse.solution.objects
            }
        }

        for (const [i, isImage] of coords.entries()) {
            if (isImage) {
                await captchaFrame.click(`div.task-image:nth-child(${i + 1})`)
            }
            await sleep(Math.floor(Math.random() * (600 - 100) + 100)) // random delay between clicks
        }

        let submitBtn = await body.$('.button-submit.button')
        await submitBtn.evaluate(b => {
            b.click()
        })

        if (opts.retry) {
            await sleep(2500)
            if (await captchaFrame.$('body')) {
                const tryAgain = await body.$eval('.display-error', el => {
                    return el.getAttribute('aria-hidden')
                })
                if (tryAgain === 'false') {
                    if (opts.verboseLevel !== 0) {
                        console.log(`puppeteer-extra-plugin-capsolver: (WARN) Retrying hcaptcha ...`)
                    }
                    await solve(captchaFrame)
                }
            }
        }

    }

    if (captchaFrame) {
        await solve(captchaFrame)
        if (twoStepCaptcha === true) {
            if (opts.verboseLevel !== 0) {
                console.log('puppeteer-extra-plugin-capsolver: (INFO) Double challenge found! Solving ...')
            }
            await solve(captchaFrame)
        }
    }
}

/** HCAPTCHA COMMONS */
async function _switchLanguage(body, opts) {
    const languageSelector = await body.waitForSelector('.language-selector')
    // force english language
    await languageSelector.click()
    const [lang] = await body.$x('//span[contains(text(), \'English\')]')

    if (lang) {
        await lang.click().catch((e) => {
            if (opts.verboseLevel !== 0) {
                console.log(`puppeteer-extra-plugin-capsolver: Unable to change language, sending original question.`)
            }
        })
    }
}

async function _triggerChallenge(page, opts, checkboxFrame) {
    const defaultCheckboxSelector = 'iframe[title*="containing checkbox for hCaptcha"]'
    return new Promise(async (resolve) => {
        let captchaFrame
        await page.waitForSelector(defaultCheckboxSelector).catch((e) => {
            if (opts.verboseLevel !== 0) {
                throw `puppeteer-extra-plugin-capsolver: (ERROR) No HCaptcha found on this page`
            }
        })
        while (true) {
            if (checkboxFrame === undefined) {
                checkboxFrame = await page.$(defaultCheckboxSelector)
            }
            const captchaWidgetId = await page.evaluate((obj) => {
                return obj.getAttribute('data-hcaptcha-widget-id')
            }, checkboxFrame)
            if (captchaWidgetId.length === 0) {
                throw `puppeteer-extra-plugin-capsolver: (ERROR) Argument passed is not an HCaptcha checkbox frame`
            }
            let frameElements = await page.$$(`iframe[src*='${captchaWidgetId}']`)
            captchaFrame = await frameElements[1].contentFrame()
            if (await captchaFrame.$eval('body', (e) => {
                return e.getAttribute('aria-hidden')
            }) === null) {
                break
            }
            await checkboxFrame.click()
            await sleep(2500)
        }
        resolve([await checkboxFrame.contentFrame(), captchaFrame])
    })
}

/** MAIN EXPORTS */

/**
 * hcaptchaclicker - solve function entrypoint - pass specific hcatpcha checkbox iframe element for solve/ or run for solve default hcaptcha on a page
 * */
async function hcaptchaclicker(page, opts, checkboxFrame) {
    return new Promise(async (resolve) => {
        // trigger and retrieve the relative captcha challenge frame
        const [checboxFrameContent, captchaFrame] = await _triggerChallenge(page, opts, checkboxFrame)

        // check which challenge (grid or area)
        const captchaImagesGrid = await captchaFrame.$('.task-grid')

        if (captchaImagesGrid === null) {
            throw `puppeteer-extra-plugin-capsolver: (ERROR) Only task grid is supported by .hcaptchaclicker()`
        } else {
            // executes grid clicker
            await _imageGridClicker(page, opts, captchaFrame)
            await sleep(1200)

            if (opts.retry) {
                const stylestring = await checboxFrameContent.$eval('.check', el => { return el.getAttribute('style') })
                if (stylestring === 'display: none;') {
                    if (opts.verboseLevel !== 0) { console.log(`puppeteer-extra-plugin-capsolver: (WARN) Retrying hcaptcha ...`) }
                    await hcaptchaclicker(page, opts, checkboxFrame)
                } else {
                    resolve('solved')
                }
            }
        }
    })
}


module.exports = {hcaptchaclicker}