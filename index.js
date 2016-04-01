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
 .option('-x, --extra ' + chalk.yellow('<optional>') , 'The extra data required for special exchanges (e.g. Payment Id, incase of monero)')
 .option('-p, --pair ' + chalk.red('<required>') ,'The pair in conversion (e.g. bitcoin to ether; btc_eth)')
 .parse(process.argv);

console.log(chalk.dim('[' + moment().format('hh:mm:ss a') +']:') + '	welcome to rapidshift version ' + program._version + ' - @bitcoinssg');
accounting.populateBeforeExchange(program.pair); // start populating stats asyncly, if error, gchecks will catch it.
gchecks.checkall(program)
.then(accounting.populateForExchangefromShapeshift(program.pair))
.then(function(){
	var deferred = Q.defer();
	process.stdout.write("\n");
	//console.log(accounting);
	console.log("");
	deferred.resolve(program);
	return deferred.promise;
})
.then(function(program){
	var deposit_limit = 0;
	shapeshift.marketInfo(program.pair, function (err, marketInfo) {
	  if(err){
	  	console.log('there was an error from marketinfo');
	  	console.log(err);
	  }
	  else {
	  		deposit_limit = marketInfo.limit;
	  		// console.log('');
	  		// console.log(marketInfo);
	  		// console.log('');
	  		var options = {
	  			returnAddress: program.refund
	  		}
			//shapeshift.shift(program.destination, program.pair, options, function (err, returnData) {
			mockfunctions.mockshapeshiftshift(program.destination, program.pair, options, function (err, returnData) {
				  if(err){
				  	console.log('there was an error during shift');
				  	console.log(err);

				  }

				  var depositAddress = returnData.deposit
				  //console.log(returnData);

				  console.log("");
				  console.log( "send upto " + chalk.green(deposit_limit) + " to " + chalk.green(depositAddress) );

				  loopforcompletestatus(depositAddress);
			});
	  }
	})

})
.catch(function(err){
	process.stdout.write("\n\n");
	process.stdout.write('\n' + '[' + moment().format('hh:mm:ss a') +']'+ chalk.red('	error: 	') +  chalk.red(err));
	process.stdout.write("\n\n\n");

});


function loopforcompletestatus(depositAddress, counts ){
	var shift_status = "no_deposits";
	var counts = counts || { no_deposits: 0, received: 0, complete: 0};
	setTimeout(function(){
		//shapeshift.status(depositAddress, function (err, status, data) {
		mockfunctions.mockshapeshiftstatus(depositAddress, function (err, status, data) {
		   if(status == "no_deposits"){ 
		   	(counts.no_deposits == 0) ? process.stdout.write('[' + moment().format('hh:mm:ss a') + ']' + chalk.red(":-\\  	waiting for deposit 	")) : process.stdout.write(chalk.red("."));
		   	 counts.no_deposits++;
		   }
		   else if(status == "received"){
		   	(counts.received == 0) ?process.stdout.write('\n' + '[' + moment().format('hh:mm:ss a') + ']' + chalk.yellow(":-| 	"  + data.incomingCoin + " " + data.incomingType + " received 	")) : process.stdout.write(chalk.yellow("."));
		   	counts.received++;
		   }
		   else if(status == "complete"){
		   	process.stdout.write('\n' + '[' + moment().format('hh:mm:ss a') + ']' + chalk.green(":-) 	")); 
		   	console.log(chalk.green(data.outgoingCoin) + " " + chalk.green(data.outgoingType + " sent 	✓"));
		   	console.log("");
		   	console.log("");
		   }
		   else{
		   	console.log('error');
		   }
		   shift_status = status;
		   if( shift_status != "complete"){
		   		loopforcompletestatus(depositAddress, counts);
		   }
	  	})
	},100)
}


