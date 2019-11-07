const launchChrome = require('@serverless-chrome/lambda')
const CDP = require('chrome-remote-interface')
const puppeteer = require('puppeteer')

exports.handler = async (event, context, callback) => {
  const {
    url = process.env.DEFAULT_URL,
    width = process.env.DEFAULT_WIDTH,
    height = process.env.DEFAULT_HEIGHT
  } = event.queryStringParameters || {}

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

    return callback(null, {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': 'image/png'
      },
      body: screenshotBuffer.toString('base64')
    })
  } catch (err) {
    console.error(err)
    return callback(null, {
      statusCode: 500,
      body: err
    })
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
