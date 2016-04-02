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
const mockfunctions = require('./tests/mockfunctions');
var timeTracking = {start: moment().format('hh:mm:ss a')};

program
 .version('0.0.1')
 .option('-d, --destination ' + chalk.red('<required>'), 'The address where you want your funds sent after exchange.')
 .option('-r, --refund '+ chalk.red('<required>'), 'The refund address')
 .option('-x, --extra ' + chalk.yellow('<optional>') , 'The extra data required for special exchanges')
 .option('-p, --pair ' + chalk.red('<required>') ,'The pair in conversion (e.g. bitcoin to ether; btc_eth)')
 .parse(process.argv);

console.log(chalk.dim('[' + moment().format('hh:mm:ss a') +']:') + '	welcome to rapidshift version ' + program._version + ' - @bitcoinssg');
gchecks.checkall(program)
.then(accounting.populateBeforeExchange)
.then(printExchangeInfoBeforeExchange)
.then(prepareOptionsForShiftApi)
.then(shiftwithpromise)
.then(function(){
	loopforcompletestatus({ no_deposits: 0, received: 0, complete: 0}, function(){
		printExchangeAfterExchange();
	});
})
.catch(function(err){
	process.stdout.write("\n\n");
	process.stdout.write('\n' + '[' + moment().format('hh:mm:ss a') +']'+ chalk.red('	error: 	') +  chalk.red(err));
	process.stdout.write("\n\n\n");

});










function shiftwithpromise(options){
	var deferred = Q.defer();
	//mockfunctions.mockshapeshiftshift(program.destination, program.pair, options, function (err, returnData) {
	shapeshift.shift(program.destination, program.pair, options, function (err, returnData) {
		if(err){
			console.log('there was an error during shift');
			console.log(err);
		}
		else{
		  console.log( chalk.dim('[' + moment().format('hh:mm:ss a') +']:	')); 
		  console.log( chalk.dim('[' + moment().format('hh:mm:ss a') +']:	') +
		   		 "Send " + accounting.sourceCoin.fullname + ":	" + chalk.bgBlue(accounting.exchangeLimit.amount) + " (MAX)");
		  if(accounting.sourceCoin.symbol == 'xmr')
			{
				// when monero is source handle payment id from shapeshift
				console.log( chalk.dim('[' + moment().format('hh:mm:ss a') +']:	')  +"Address:	" + chalk.bgBlue(returnData.sAddress));
				console.log( chalk.dim('[' + moment().format('hh:mm:ss a') +']:	') +  "paymentID:	" + chalk.bgWhite(chalk.black(returnData.deposit)));
			}
		   else{
		   		console.log( chalk.dim('[' + moment().format('hh:mm:ss a') +']:	')  +"Address:	" + chalk.bgBlue(returnData.deposit) );
		   }
		  console.log( chalk.dim('[' + moment().format('hh:mm:ss a') +']:	'));
		  //console.log(returnData);
		  accounting.depositAddress = returnData.deposit;
		  //loopforcompletestatus(returnData.deposit);
		  deferred.resolve()
		}
	});
	return deferred.promise;
}




// extra preparation for multiple coin type handling
function prepareOptionsForShiftApi(){  
	var deferred = Q.defer();
	var options = { returnAddress: program.refund };
	if(accounting.exchangeLimit.amount > 0){
		if(accounting.destinationCoin.symbol == 'xmr')
		{
			// treat monero is destination coin then prepare with payment id in options
			// turns out we don't need to do anything from out side when we're receiving monero
			// when we are sending monero a payment id is received and handled by the output
		}
		deferred.resolve(options);
	}
	else{
		deferred.reject("Shapeshift limit is 0, try again in a few minutes.")
	}

	return deferred.promise;
}

function printExchangeAfterExchange(){
	var deferred = Q.defer();
	console.log(chalk.dim('[' + moment().format('hh:mm:ss a') +']:	') + 
		accounting.destinationCoin.fullname + ' price: ($'+ accounting.destinationCoin.priceFromExternal_USD + ')	'  + 
		'actual price: ' + '($' + accounting.destinationCoin.priceCostAfterExchange_USD + ') = ' +
		accounting.percentages.percentCostAfterExchange + '%' );
	console.log("");
	console.log("");
	deferred.resolve();
	return deferred.promise;
}


function printExchangeInfoBeforeExchange(){
	var deferred = Q.defer();
	console.log('');
	console.log(chalk.dim('[' + moment().format('hh:mm:ss a') +']:	') + accounting.sourceCoin.fullname + ' price: ($'+ accounting.sourceCoin.priceFromExternal_USD + ')');
	console.log(chalk.dim('[' + moment().format('hh:mm:ss a') +']:	') + '   |');
	console.log(chalk.dim('[' + moment().format('hh:mm:ss a') +']:	') + '   V');
	console.log(chalk.dim('[' + moment().format('hh:mm:ss a') +']:	') + 
		accounting.destinationCoin.fullname + ' price: ($'+ accounting.destinationCoin.priceFromExternal_USD + ')	'  + 
		' implied price: ' + '($' + accounting.destinationCoin.priceProposedDuringExchange_USD + ') = ' +
		accounting.percentages.percentProposedDuringExchange + '%');
	deferred.resolve();
	return deferred.promise;
}




function loopforcompletestatus(counts,callback){
	var shift_status = "no_deposits";
	var depositAddress = accounting.depositAddress;
	var counts = counts || { no_deposits: 0, received: 0, complete: 0};
	setTimeout(function(){
		shapeshift.status(depositAddress, function (err, status, data) {
		//mockfunctions.mockshapeshiftstatus(depositAddress, function (err, status, data) {
		   if(status == "no_deposits"){ 
		   	(counts.no_deposits == 0) ? process.stdout.write(chalk.dim('[' + moment().format('hh:mm:ss a') +']:	')+ "waiting for deposit		") : process.stdout.write(chalk.red("."));
		   	 counts.no_deposits++;
		   }
		   else if(status == "received"){
		   	(counts.received == 0) ?process.stdout.write('\n' + chalk.dim('[' + moment().format('hh:mm:ss a') +']:	')  + data.incomingCoin + " " + data.incomingType + " received		") : process.stdout.write(chalk.yellow("."));
		   	counts.received++;
		   }
		   else if(status == "complete"){
		   	process.stdout.write('\n' + chalk.dim('[' + moment().format('hh:mm:ss a') +']:	')); 
		   	console.log(data.outgoingCoin + " " + data.outgoingType + " sent		" + chalk.bgGreen("Success"));
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
	},15000)
}


