"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require('request');
const webhookService = express();
const Assistant = require('actions-on-google').DialogflowApp;

const port = process.env.PORT || 7000;

// the actions we are supporting (get them from api.ai)
const ACTION_PRICE = 'price';
const ACTION_TOTAL = 'total';
const ACTION_BLOCK = 'block';
const ACTION_MARKET = 'marketcap';
const ACTION_INTERVAL = 'interval';

// The end-points to our calls
const EXT_BITCOIN_API_URL = "https://blockchain.info";
const EXT_PRICE = "/q/24hrprice";
const EXT_TOTAL = "/q/totalbc";
const EXT_BLOCK_COUNT = "/q/getblockcount";
const EXT_MARKET_CAP = "/q/marketcap";
const EXT_INTERVAL = "/q/interval";

webhookService.use(
  bodyParser.urlencoded({
    extended: true
  })
);

webhookService.use(bodyParser.json());

webhookService.post("/", function(req, res) {
    const assistant = new Assistant({request: req, response: res});
//   var action =
//     req.body.result &&
//     req.body.result.action
//     //req.body.result.parameters.echoText
//       ? req.body.result.action
//       : "Seems like some problem. Speak again.";
//   switch (action) {
//       case "price": 
//         priceHandler(EXT_PRICE, assistant);
//       break; 
//   }
    // Fulfill price action business logic
  function priceHandler (assistant) {
    request(EXT_BITCOIN_API_URL + EXT_PRICE, function(error, response, body) {
      // The fulfillment logic for returning the bitcoin current price
      //console.log("priceHandler response: " + JSON.stringify(response) + " Body: " + body + " | Error: " + error);
      const msg = "Right now the price of a bitcoin is " + body + " USD. What else would you like to know?";
      assistant.ask(msg);
    });
  }

  // Fulfill total bitcoin action 
  function totalHandler (assistant) {
    request(EXT_BITCOIN_API_URL + EXT_TOTAL, function(error, response, body) {
      //console.log("totalHandler response: " + JSON.stringify(response) + " Body: " + body + " | Error: " + error);
      // The fulfillment logic for returning the amount of bitcoins in the world
      const billionsBitcoins = body / 1000000000;
      const msg = "Right now there are " + billionsBitcoins + " billion bitcoins around the world. What else would you like to know?";
      assistant.ask(msg);
    });
  }
  
  // Fulfill block count action
  function blockCountHandler (assistant) {
    request(EXT_BITCOIN_API_URL + EXT_BLOCK_COUNT, function(error, response, body) {
      //console.log("blockCountHandler response: " + JSON.stringify(response) + " Body: " + body + " | Error: " + error);
      const msg = "Right now there are " + body + " blocks. What else would you like to know? the price?";
      assistant.ask(msg);
    });
  }

  // Fulfill market cap action
  function marketCaptHandler (assistant) {
    request(EXT_BITCOIN_API_URL + EXT_MARKET_CAP, function(error, response, body) {
      console.log("marketCaptHandler response: " + JSON.stringify(response) + " Body: " + body + " | Error: " + error);
      const marketCapB = Math.round((body / 1000000000) * 100) / 100
      const msg = "Right now market cap is " + marketCapB + " billions. What else would you like to know?";
      assistant.ask(msg);
    });
  }
  
  // Fulfill interval action
  function intervalHandler (assistant) {
    request(EXT_BITCOIN_API_URL + EXT_INTERVAL, function(error, response, body) {
      //console.log("interval response: " + JSON.stringify(response) + " Body: " + body + " | Error: " + error);
      const msg = "Right now the interval between blocks is " + body + " seconds. What else would you like to know?";
      assistant.ask(msg);
    });
  }

  // The Entry point to all our actions
  const actionMap = new Map();
  actionMap.set(ACTION_PRICE, priceHandler);
  actionMap.set(ACTION_TOTAL, totalHandler);
  actionMap.set(ACTION_BLOCK, blockCountHandler);
  actionMap.set(ACTION_MARKET, marketCaptHandler);
  actionMap.set(ACTION_INTERVAL, intervalHandler);
  
  assistant.handleRequest(actionMap);    
});

webhookService.listen(port, function() {
  console.log("Server up and listening to port "+port);
});
