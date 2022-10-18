const getSymbolData = async (...symbols) => {
  console.log(symbols);
  const quotes_raw = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(",")}`);
  const quotes = await quotes_raw.json();

  const result = quotes.quoteResponse.result.map((quote) => ({
    price: quote.regularMarketPrice,
    changePercent: quote.regularMarketChangePercent,
    change: quote.regularMarketChange,
  }));

  return result;
}

module.exports = { getSymbolData }