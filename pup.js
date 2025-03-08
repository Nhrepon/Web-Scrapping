const puppeteer = require('puppeteer');
const fs = require('fs');
const axios  = require('axios');

const url = 'https://www.goodreads.com/quotes?page=15';

// Run the scraper
scrapeQuotes(url);


async function scrapeQuotes(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "New" }); // Set to true for faster execution
    const page = await browser.newPage();
    // Set user agent to avoid detection
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      );

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the page to fully render
    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.waitForSelector('.quoteText', { visible: true, timeout: 15000 });

    const quotes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.quoteText')).map((quoteElement) => {
        // Extract quote text and clean it
        let quoteText = quoteElement.childNodes[0].textContent.trim();
        quoteText = quoteText.replace(/^“|”$/g, ''); // Remove extra quotation marks

        // Extract author name and clean it
        const authorElement = quoteElement.querySelector('.authorOrTitle');
        let author = authorElement ? authorElement.innerText.trim() : "Unknown";
        author = author.replace(/,$/, ''); // Remove trailing commas

        return { quote: quoteText, author };
      });
    });

    quotes.map(async(item, index) => {

        let authorData = {
            name: item.author,
            bio: "", 
            profilePicture: "",
            nationality: ""
        }
        let createAuthor = await axios.post("http://localhost:2000/api/createAuthor", authorData, 
            { headers: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im51cmhvc3NhaW5yZXBvbjcyNDhAZ21haWwuY29tIiwidXNlcklkIjoiNjdjMTNlMmZlMThjYzUxYzIyNmJiMGQ0Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQxMjc0OTQ3LCJleHAiOjE3NDM4NjY5NDd9.RP5I2do-I6Ns9mSoSdMLawJWwGdOF_Isfk5HSPgUW4c", } });

            console.log("author id is: "+ index + " = " +createAuthor.data.status+ " = "+ createAuthor.data.data._id);
        
        let data  = {
            authorId: createAuthor.data.data._id,
            categoryId: "67c93e7bff401abf3898c328",
            quote: item.quote,
            status: "pending"
        }
        let createQuote = await axios.post("http://localhost:2000/api/createQuote", data, 
            { headers: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im51cmhvc3NhaW5yZXBvbjcyNDhAZ21haWwuY29tIiwidXNlcklkIjoiNjdjMTNlMmZlMThjYzUxYzIyNmJiMGQ0Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQxMjc0OTQ3LCJleHAiOjE3NDM4NjY5NDd9.RP5I2do-I6Ns9mSoSdMLawJWwGdOF_Isfk5HSPgUW4c", } });

            console.log(createQuote.data.status);


      //console.log(index+1 +" = "+ item.quote)
    });
    console.log('Total Quotes Scraped:', quotes.length);

    // fs.writeFileSync(`quotes.json`, JSON.stringify(quotes, null, 2));
    // console.log(`Quotes saved to quotes.json`);

  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


