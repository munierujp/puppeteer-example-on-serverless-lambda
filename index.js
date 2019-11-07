const launchChrome = require('@serverless-chrome/lambda')
const CDP = require('chrome-remote-interface')
const puppeteer = require('puppeteer')

exports.handler = async (event, context, callback) => {
  const {
    url = process.env.DEFAULT_URL,
    width = process.env.DEFAULT_WIDTH,
    height = process.env.DEFAULT_HEIGHT
  } = event.queryStringParameters || {}

  if (!url.match(process.env.ALLOW_URL_PATTERN)) {
    console.error(`${url} does not match to ${process.env.ALLOW_URL_PATTERN}`)
    const resp = createErrorResponse({
      statusCode: 400,
      type: 'https://github.com/munierujp/ogp-api/blob/master/index.js',
      title: 'Invalid URL',
      detail: `${url} is not allowed URL.`
    })
    return callback(null, resp)
  }

  let chrome
  let browser
  let page

  try {
    chrome = await launchChrome({
      flags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1048,743',
        '--hide-scrollbars',
        '--enable-logging',
        '--ignore-certificate-errors',
        '--disable-setuid-sandbox'
      ]
    })

    browser = await puppeteer.connect({
      ignoreHTTPSErrors: true,
      browserWSEndpoint: (await CDP.Version()).webSocketDebuggerUrl
    })

    page = await browser.newPage()

    page.setViewport({
      width: Number(width),
      height: Number(height)
    })

    await page.setUserAgent(process.env.USER_AGENT)

    await page.goto(url)

    const screenshotBuffer = await page.screenshot()

    const resp = {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'image/png'
      },
      body: screenshotBuffer.toString('base64')
    }
    return callback(null, resp)
  } catch (err) {
    console.error(err)
    const resp = createErrorResponse({
      statusCode: 500,
      type: 'https://github.com/munierujp/ogp-api/blob/master/index.js',
      title: 'Failed to capture screenshot'
    })
    return callback(null, resp)
  } finally {
    if (page) {
      await page.close()
    }

    if (browser) {
      await browser.disconnect()
    }

    if (chrome) {
      await chrome.kill()
    }
  }
}

/**
* Create error response conforming to RFC 7807
* see https://tools.ietf.org/html/rfc7807
*/
function createErrorResponse ({ statusCode, type, title, detail }) {
  const body = JSON.stringify({
    type,
    title,
    detail
  })
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/problem+json'
    },
    body
  }
}
