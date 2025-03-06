const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.goodreads.com/quotes';

async function scrapeQuotes() {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const quotes = [];

    $('.quoteText').each((index, element) => {
      const quote = $(element).text();
      quotes.push(quote);
    });

    fs.writeFileSync('quotes.json', JSON.stringify(quotes, null, 2));
    console.log('Total Quotes Scraped:', quotes.length);
  } catch (error) {
    console.error('Error scraping data:');
  }
}

scrapeQuotes();