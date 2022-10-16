
const yahooFinance = require("yahoo-finance");

const getSymbolData = async (symbol) => {
  const quote = await yahooFinance.quote({
    symbol
  });

  return {
    price: quote.price.regularMarketPrice,
    changePercent: quote.price.regularMarketChangePercent,
    change: quote.price.regularMarketChange,
  };
}

module.exports = { getSymbolData }