const puppeteer = require("puppeteer")
const Style = require("./style")
const gender = "Womens"

async function Scrape() {
  const results = []
  const browser = await puppeteer.launch({ headless: false })

  const page = await browser.newPage()

  //WO1 5mm wetsuits style_id = 4
  //https://www.watersportsoutlet.com/womens-c-22_68.html

  //WO1 2mm wetsuits style_id = 1
  //https://www.watersportsoutlet.com/womens-c-195_505.html

  //WO1 3mm wetsuits style_id = 2
  //https://www.watersportsoutlet.com/womens-c-21_60.html?max=180

  //WO1 4mm wetsuits style_id = 3
  //https://www.watersportsoutlet.com/womens-4mm-c-155_157.html?max=180

  //WO1 springsuits style_id = 8
  //https://www.watersportsoutlet.com/womens-c-47_65.html?max=180

  //WO1 tops style_id = 10
  //https://www.watersportsoutlet.com/womens-neoprene-tops-c-663_89_166.html

  const scrapeUrls = [
    "https://www.watersportsoutlet.com/womens-neoprene-tops-c-663_89_166.html",
  ]
  const style_id = "10"

  let urlArray = []

  try {
    for (let i = 0; i < scrapeUrls.length; i++) {
      await page.goto(scrapeUrls[i])

    
      let tempArray = await page.$$eval(
        "div.prod:nth-of-type(n+3) a",
        (links) => links.map((link) => link.href)
      )
      urlArray.push(...tempArray)
    }

    for (let item of urlArray) {
      page.setDefaultNavigationTimeout(0)
      await page.goto(item)

      const retailer_id = "WO1"

      await page.waitForSelector("meta[property='og:url']", {
        timeout: 100000,
      })

      const url = item

      const name = await page.evaluate(() => {
        let el = document.querySelector("span.second")
        return el ? el.innerText : ""
      })

      const brand = await page.evaluate(() => {
        let el = document.querySelector(".block a")
        return el ? el.innerText : ""
      })

      const sku = await page.evaluate(() => {
        let el = document.querySelector("span.model")
        return el ? el.innerText : ""
      })

      const description = await page.evaluate(() => {
        let el = document.querySelector("span#prodDesc")
        return el ? el.innerText : ""
      })

      const price = await page.$eval('meta[name="twitter:data1"]', (tag) =>
        tag.getAttribute("content").replace(" USD", "")
      )

      let tempSizes = await page.$$eval(
        "li.attributeItem.available:nth-of-type(n+2) a",
        (el) => el.map((x) => x.innerText.replace(/^US +/i, ""))
      )
      const sizes = tempSizes.toString()

      const image = await page.$eval("main .image img ", (tag) =>
        tag.getAttribute("src")
      )

      

      

      results.push({
        retailer_id,
        url,
        name,
        brand,
        sku,
        description,
        price,
        sizes,
        image,
        style_id,
        gender,
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    // console.log(JSON.stringify(results))

    // const path = "/Users/damaristorrent/Capstone Project/api/src/assets/"
    const path = ""
    const fileName =
      results[0].retailer_id + "_" + Style.Style(results[0].style_id) + ".json"
    const filePath = path + fileName

    require("fs").writeFile(filePath, JSON.stringify(results), (error) => {
      if (error) {
        throw error
      }
    })

    browser.close()
  }
}

module.exports = { Scrape }
