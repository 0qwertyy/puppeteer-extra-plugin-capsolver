async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function parseUrlParams(url){
    const params = {}
    const queryString = url.split('?')[1]
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [name, value] = param.split('=')
            params[name] = decodeURIComponent(value)
        })
    }
    return params
}

function validateApiKey(apiKey) {
    const regex = /^([A-Z]{3})-(\w{32})$/
    if(regex.test(apiKey) && apiKey.slice(4) !== apiKey.slice(4).split('').reverse().join('')){ return apiKey }
    else{ throw `puppeteer-extra-plugin-capsolver: (ERROR) API key invalid format` }
}

module.exports = { sleep: sleep, parseUrlParams: parseUrlParams, validateApiKey: validateApiKey }