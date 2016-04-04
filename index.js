#!/usr/bin/env node
const program = require('commander');
const co = require('co');
const Q = require('q');
const prompt = require('co-prompt');
const shapeshift = require('shapeshift.io');
const chalk = require('chalk');
const moment = require('moment');
const gchecks = require('./lib/checks');
const accounting = require('./lib/accounting');
const printTemplates = require('./lib/printTemplates');
const mockfunctions = require('./tests/mockfunctions');
const qrcode = require('qrcode-terminal');
const utils = require('./lib/utils');
var timeTracking = {start: moment().format('hh:mm:ss a')};
const packagejson = require('./package.json');


program
 .version(packagejson.version)
 .usage('--refund <your refund address> --destination <your withdrawl address> --pair <symbolOfSourceCoin_symbolOfDestinatinCoin> --[other options] \n\n\n' +
 	'	example 1 : rapidshift --refund  ' + chalk.cyan(chalk.bold('12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX')) + 
 	' --destination ' + chalk.cyan(chalk.bold('0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae')) +' --pair ' + chalk.cyan(chalk.bold('btc_eth'))+' \n' +
 	'	example 2 : rapidshift --refund  ' + chalk.cyan(chalk.bold('1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1')) + 
 	' --destination ' + chalk.cyan(chalk.bold('LSdTvMHRm8sScqwCi6x9wzYQae8JeZhx6y')) +' --pair ' + chalk.cyan(chalk.bold('btc_ltc'))+ ' --qrcode ' + chalk.cyan(chalk.bold('show'))+' \n' )
 .option('-d, --destination ' + chalk.red('<required>'), 'address where you want your funds sent after exchange.')
 .option('-r, --refund '+ chalk.red('<required>'), 'your refund address incase anything goes wrong during an exchange')
 .option('-p, --pair ' + chalk.red('<required>') ,'pair in conversion, using official symbols (e.g. bitcoin to ether; btc_eth, dash to ether; dash_eth)')
 .option('-x, --extra ' + chalk.yellow('<optional>') , 'extra data required for special exchanges')
 .option('-q, --qrcode [show] ' + chalk.yellow('<optional>') , 'execute this if you want the qr codes to show up for payments')
 .option('-m, --minimum [amount in USD] ' + chalk.yellow('<optional>'), 'minimum threshold on USD exchanged')
 .option('-X, --mock [yes] ' + chalk.yellow('<optional>'), 'use this to run a fake/mock execution [for devs]')
 .parse(process.argv);

if(program.mock) printTemplates.mock = true;
console.log("");
console.log(printTemplates.printTimeStamp() + printTemplates.printHashes());
console.log(printTemplates.printTimeStamp() + chalk.dim('[' + moment().format('MMMM/DD/YY').toLowerCase() + ']') 
	+ (' ').repeat(25) + 'rapidshift version ' + program._version +
	 (' ').repeat(27) + chalk.dim('@bitcoinssg'));
if(program.mock) console.log(printTemplates.printTimeStamp() + (' ').repeat(46) + chalk.cyan(chalk.bold("mock run")));
gchecks.checkall(program)
.then(accounting.populateBeforeExchange)
.then(printExchangeInfoBeforeExchange)
.then(prepareForShiftApi)
.then(shiftwithpromise)
.then(function(){
	loopforcompletestatus({ no_deposits: 0, received: 0, complete: 0}, function(){
		printExchangeAfterExchange().then(function(){
			console.log(printTemplates.printTimeStamp() + printTemplates.printHashes());
			console.log("");
		});
	});
})
.catch(function(err){
	process.stdout.write("\n");
	console.log(printTemplates.printTimeStamp() + chalk.bgRed('error		 	') +  chalk.bgRed(err))
	process.stdout.write("\n");
	console.log(printTemplates.printTimeStamp() + printTemplates.printHashes());
	console.log("");

});










function shiftwithpromise(options){
	var deferred = Q.defer();
	// if mock/fake mode, run mock function instead or real one
	var _shapeshiftshift = (program.mock) ? mockfunctions.mockshapeshiftshift : shapeshift.shift;
	_shapeshiftshift(program.destination, program.pair, options, function (err, returnData) {
		if(err){
			console.log('there was an error during shift');
			console.log(err);
		}
		else{
			  console.log( printTemplates.printTimeStamp()); 
			  console.log( printTemplates.printTimeStamp() +
			   		 "send MAX of		" + chalk.bgBlue(accounting.exchangeLimit.amount.toPrecision(utils.precision())) + " " + accounting.sourceCoin.fullname.toLowerCase() + " or " +
			   		 "$" + (parseFloat(accounting.exchangeLimit.amount) * accounting.sourceCoin.priceFromExternal_USD).toPrecision(utils.precision()) + " equivalent");
			  if(accounting.sourceCoin.symbol == 'xmr')
				{
					// when monero is source handle payment id from shapeshift
					console.log( printTemplates.printTimeStamp()  +"to address		" + chalk.bgBlue(returnData.sAddress));
					console.log( printTemplates.printTimeStamp() +  "paymentID		" + chalk.bgBlue(returnData.deposit));
				}
			   else{
			   	    console.log( printTemplates.printTimeStamp()  +"to address		" + chalk.bgBlue(returnData.deposit) );
			   	   	if(program.qrcode){
						qrcode.generate(returnData.deposit, function (qrcode) {
							console.log("");
						    console.log(qrcode);
						    console.log("");
						});
			  		}
			   }
			  console.log( printTemplates.printTimeStamp());
			  accounting.depositAddress = returnData.deposit;
			  deferred.resolve()
		}
	});
	return deferred.promise;
}




// extra preparation for multiple coin type handling
function prepareForShiftApi(){  
	var deferred = Q.defer();
	var options = { returnAddress: program.refund };
	if(accounting.exchangeLimit.amount > accounting.minimumAcceptableExchangeLimit.sourceCoinUnits){
		if(accounting.destinationCoin.symbol == 'xmr')
		{
			// turns out we don't need to do anything from out side when we're receiving monero
			// when we are sending monero a payment id is received and handled by shiftwithpromise()
		}
		deferred.resolve(options);
	}
	else{
		deferred.reject("shapeshift.io's limit is " + parseFloat(accounting.exchangeLimit.amount) +
		 " or $"  + (parseFloat(accounting.exchangeLimit.amount) * parseFloat(accounting.sourceCoin.priceFromExternal_USD)).toPrecision(utils.precision())  + 
			", minimum threshold is set at $" + accounting.minimumAcceptableExchangeLimit.USD.toPrecision(utils.precision()));
	}

	return deferred.promise;
}

function printExchangeAfterExchange(){
	var deferred = Q.defer();
	console.log(printTemplates.printTimeStamp() + 'transaction id			' + accounting.exchangeTxId);
	console.log(printTemplates.printTimeStamp() + 
		'actual cost per ' + accounting.destinationCoin.symbol.toLowerCase() + ' ' +'		$' + accounting.destinationCoin.priceCostAfterExchange_USD.toPrecision(utils.precision()) + ' or ' +
		accounting.percentages.percentCostAfterExchange.toFixed(2) + '%' + ' of current price');
	console.log(printTemplates.printTimeStamp() + 'cost of exchange' + '			$' + accounting.AfterExchangeStats.costForExchange.toPrecision(utils.precision())); //+  (' ').repeat(52)  + chalk.green('done') );
	deferred.resolve();
	return deferred.promise;
}


function printExchangeInfoBeforeExchange(){
	var deferred = Q.defer();
	console.log('');
	console.log(printTemplates.printTimeStamp() + accounting.sourceCoin.fullname.toLowerCase() + '		$'+ accounting.sourceCoin.priceFromExternal_USD.toPrecision(utils.precision()));
	console.log(printTemplates.printTimeStamp() + '  |');
	console.log(printTemplates.printTimeStamp() + '  V');
	console.log(printTemplates.printTimeStamp() + 
		accounting.destinationCoin.fullname.toLowerCase() + '		$'+ accounting.destinationCoin.priceFromExternal_USD.toPrecision(utils.precision()) + '	'  + 
		'implied price (shapeshift.io)	' + '$' + parseFloat(accounting.destinationCoin.priceProposedDuringExchange_USD).toPrecision(utils.precision()) + ' or ' +
		accounting.percentages.percentProposedDuringExchange.toFixed(2) + '%');
	deferred.resolve();
	return deferred.promise;
}




function loopforcompletestatus(counts,callback){
	var shift_status = "no_deposits";
	var depositAddress = accounting.depositAddress;
	var counts = counts || { no_deposits: 0, received: 0, complete: 0};
	// this next if statetement could have been inside the loop, but want the delay in printing.
	(counts.no_deposits == 0) ? process.stdout.write(printTemplates.printTimeStamp() + "waiting for " + accounting.sourceCoin.symbol.toLowerCase() + " deposit		" ) : null;
	setTimeout(function(){
		// if mock/fake mode, run mock function instead or real one
		var _shapeshiftstatus = (program.mock) ? mockfunctions.mockshapeshiftstatus : shapeshift.status;
		_shapeshiftstatus(depositAddress, function (err, status, data) {
		   if(status == "no_deposits"){ 
		   	(counts.no_deposits == 0) ? null : process.stdout.write(chalk.red(chalk.bold(".")));
		   	 counts.no_deposits++;
		   }
		   else if(status == "received"){
		   	(counts.received == 0) ? process.stdout.write("\n" + printTemplates.printTimeStamp()  +
		   	 chalk.yellow(chalk.bold(parseFloat(data.incomingCoin).toPrecision(utils.precision()))) + 
		   	 "	" + data.incomingType.toLowerCase() + " or $" +
		   	  chalk.yellow(chalk.bold((parseFloat(data.incomingCoin) * parseFloat(accounting.sourceCoin.priceFromExternal_USD)).toPrecision(utils.precision()))) +
		   	   " recv.	") : process.stdout.write(chalk.yellow(chalk.bold(".")));
		   	counts.received++;
		   }
		   else if(status == "complete"){
		   	// if somehow during the ticks, the received is skipped do what is needed for displaying received info.
		   	if(counts.received == 0){
		   		process.stdout.write("\n" + printTemplates.printTimeStamp()  +
		   		chalk.yellow(chalk.bold(parseFloat(data.incomingCoin).toPrecision(utils.precision()))) + 
			   	 "	" + data.incomingType.toLowerCase() + " or $" +
		   		chalk.yellow(chalk.bold((parseFloat(data.incomingCoin) * parseFloat(accounting.sourceCoin.priceFromExternal_USD)).toPrecision(utils.precision()))) + " recv.	");
				counts.received++;
		   	}
		   	process.stdout.write("\n" + printTemplates.printTimeStamp() +
		   	chalk.green(chalk.bold(parseFloat(data.outgoingCoin).toPrecision(utils.precision()) )) +
		   	"	" + data.outgoingType.toLowerCase() + " or $" +
		   	chalk.green(chalk.bold((parseFloat(data.outgoingCoin) * parseFloat(accounting.destinationCoin.priceFromExternal_USD)).toPrecision(utils.precision()))) +
		   	 " sent	" + chalk.green(chalk.bold('success')) + "\n");
		   	accounting.populateAfterExchange(data).then(function(returneddata){
		   		callback();
		   	})

		   }
		   else{
		   	console.log('error');
		   }
		   shift_status = status;
		   if( shift_status != "complete"){
		   		loopforcompletestatus(counts,callback);
		   }
	  	})
	},((program.mock) ? 500 : 15000) )
}


