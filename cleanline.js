const puppeteer = require("puppeteer")
const { Style } = require("./style")
const { retailerUrls } = require("./utility")
const gender = "Womens"

async function Scrape() {
  //retailerUrls is an object that contains the Style Id, urls to be scraped, and retailer id
  //forEach loop will go through each of the style ids and scrape multiple urls
  retailerUrls.forEach(async (element) => {
    const scrapeUrls = element.urls

    const style_id = element.style_id

    const retailer_id = element.retailer

    const results = []
    const browser = await puppeteer.launch({ headless: false })

    const page = await browser.newPage()
    let urlArray = []

    //Open each page to be scraped and get all the product urls of each product on the page
    //Store those urls in an array
    for (let i = 0; i < scrapeUrls.length; i++) {
      await page.goto(scrapeUrls[i])

      let tempArray = await page.$$eval("a.product", (links) =>
        links.map((link) => link.href)
      )
      urlArray.push(...tempArray)
    }

    //For every product in the array, go to the page and scrape elements
    //Could not use .forEach here, had problems with the async/await
    for (let item of urlArray) {
      page.setDefaultNavigationTimeout(0)
      await page.goto(item)

      const url = item

      const name = await page.$eval("span.name", (el) => el.innerText)

      const brand = await page.$eval("span.brand", (el) => el.innerText)

      const sku = await page.$eval("div[itemprop='sku']", (el) => el.innerText)

      const description = await page.$eval(".value p", (el) => el.innerText)

      const price = await page.evaluate(() => {
        return document.head
          .querySelector('meta[property="product:price:amount"]')
          .getAttribute("content")
      })

      let tempSizes = await page.$$eval("div.text", (el) =>
        el.map((x) => x.innerText)
      )
      const sizes = tempSizes.toString()

      const image = await page.evaluate(() => {
        return document.head
          .querySelector('meta[property="og:image"]')
          .getAttribute("content")
      })

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

    browser.close()
    const path = ""
    const fileName =
      results[0].retailer_id + "_" + Style(results[0].style_id) + ".json"
    const filePath = path + fileName

    require("fs").writeFile(filePath, JSON.stringify(results), (error) => {
      if (error) {
        throw error
      }
    })
  })
}

module.exports = { Scrape }
