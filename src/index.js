'use strict'
const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

const CapSolver = require('capsolver-npm')

const { hcaptchaclicker } = require('./contents/hcaptcha')
const { validateApiKey } = require('./functions')

/**
 * puppeteer-extra plugin for capsolver.com service
 * integrates capsolver-npm (api wrapper) & adds extra captcha DOM features
 */
class CapSolverPlugin extends PuppeteerExtraPlugin {
    constructor(opts = {}) {
        super(opts)
    }

    get name() {
        return 'capsolver'
    }

    get defaults() {
        return {
            apiKey: null,
            verboseLevel: 0,
            solver: {
                auto: false,
                retry: true
            }
        }
    }

    async onPluginRegistered() {
        if(this.opts.verboseLevel !== 0 && !this.opts.solver.retry){
            console.log(`puppeteer-extra-plugin-capsolver: set solver.retry=false`)
        }
        this.opts.handler = new CapSolver(validateApiKey(this.opts.apiKey), this.opts.verboseLevel, 500)
    }

    async onBrowser(browser) {
        const pages = await browser.pages()

        for (const page of pages) {
            this._addBasicMethods(page)
            this._addCustomMethods(page)

            for (const frame of page.mainFrame().childFrames()) {
                this._addCustomMethods(frame)
            }
        }
    }

    async onPageCreated(page) {
        await page.setBypassCSP(true)

        this._addBasicMethods(page)
        this._addCustomMethods(page)

        page.on('frameattached', frame => {
            if (!frame) return
            this._addCustomMethods(frame)
        })
    }

    _addBasicMethods(page) {
        page.capsolver = () => { return this.opts.handler }
        page.setCapsolver = async (opts) => this.opts.handler = new CapSolver(validateApiKey(opts.apiKey), opts.verboseLevel, 500)
    }

    _addCustomMethods(page) {
        page.hcaptchaclicker = async (checkboxFrame=undefined) => hcaptchaclicker(page, this.opts, checkboxFrame)
        // page.recaptchaclicker  = async (checkboxFrame=undefined) => recaptchaclicker(page, this.opts, checkboxFrame)
    }
}

/** Default export, CapSolverPlugin */
const defaultExport = opts => new CapSolverPlugin(opts)
module.exports = defaultExport