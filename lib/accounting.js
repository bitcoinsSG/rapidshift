const Q = require('q');
const shapeshift = require('shapeshift.io');
const request = require('superagent');
const chalk = require('chalk');
const utils = require('../lib/utils');

var exchangeStats = module.exports ={
	pair : null,
	sourceCoin : { },//symbol : null, fullname : null, position: null, market_cap: null, priceChangeTodayInPercent : null,  priceFromExternal_USD : null},
	destinationCoin : { },//symbol : null, fullname : null, position: null, market_cap: null, priceChangeTodayInPercent : null,  priceFromExternal_USD : null, priceProposedDuringExchange_USD : null},
	exchangeLimit: { symbol: null, fullname : null, amount : null },
	exchangeRate : null,
	expectedVsActual : { percentageOfExpected: null, percentageOfExternal : null, AverageActualPrieInUSD : null},
	populateBeforeExchange : populateBeforeExchange
}


function populateBeforeExchange(program){
	var deferred = Q.defer();
	var pair = program.pair;
	exchangeStats.pair = pair.toLowerCase();
	var ParsedSourceCoin = pair.split("_")[0];
	var ParsedDestinationCoin = pair.split("_")[1];
	Q.all([
		populateForCoinFromExternal(ParsedSourceCoin).then(function(returnedData){
		exchangeStats.sourceCoin=utils.merge_options(exchangeStats.sourceCoin,returnedData);
		exchangeStats.exchangeLimit.symbol = exchangeStats.sourceCoin.symbol;
		exchangeStats.exchangeLimit.fullname = exchangeStats.sourceCoin.fullname;
	}),
	populateForCoinFromExternal(ParsedDestinationCoin).then(function(returnedData){
		exchangeStats.destinationCoin=utils.merge_options(exchangeStats.destinationCoin,returnedData);
	})])
	.then(function(){
		getDataFromExchangeForPair(exchangeStats).then(function(exchangeStatsmodified){
		exchangeStats.destinationCoin.priceProposedDuringExchange_USD = parseFloat(exchangeStats.sourceCoin.priceFromExternal_USD)/parseFloat(exchangeStats.exchangeRate);
		exchangeStats.expectedVsActual.percentageOfExpected = (100*(parseFloat(exchangeStats.destinationCoin.priceProposedDuringExchange_USD)/parseFloat(exchangeStats.destinationCoin.priceFromExternal_USD))).toFixed(2);
		deferred.resolve(exchangeStats);
		})
	}).catch(function(error){
		deferred.reject(error);
	})
	return deferred.promise;
}

function getDataFromExchangeForPair(exchangeStats){
	var deferred = Q.defer();
	shapeshift.marketInfo(exchangeStats.pair,function(err,marketInfo){
		if(marketInfo.error){
			deferred.reject("error : " + marketInfo.error)
		}
		else if(err){
			deferred.reject(err);
		}
		else{
			try{
				exchangeStats.exchangeLimit.amount = marketInfo.limit;
				exchangeStats.exchangeRate = marketInfo.rate;
				deferred.resolve();

			}catch(err){
				deferred.reject(err);
			}
		}
	});
	return deferred.promise;
}

function populateForCoinFromExternal(Symbol){
	var deferred = Q.defer();
	var ParsedSymbol = Symbol.toLowerCase();
	var returnedData = {};
	request
	.get('https://coinmarketcap-nexuist.rhcloud.com/api/' + ParsedSymbol)
	.end(function(err, res){
		if(err){
			console.log("error occured in http request while getting info for coin: " + ParsedSymbol)
		}
		else if(res.body.error){
			//console.log("error occured while getting info for coin: " + ParsedSymbol)
			// do nothing, gchecks should have caught the error independently
		}
		else{
			returnedData.symbol = res.body.symbol;
			returnedData.fullname = res.body.name;
			returnedData.position = res.body.position;
			returnedData.market_cap = res.body.market_cap.usd;
			returnedData.priceFromExternal_USD = res.body.price.usd;
			returnedData.supply = res.body.supply;
			returnedData.priceChangeTodayInPercent = res.body.change;
			deferred.resolve(returnedData);
		}
	});
	return deferred.promise;
}
