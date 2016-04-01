const Q = require('q');
const shapeshift = require('shapeshift.io');
const request = require('superagent');
const chalk = require('chalk');
const moment = require('moment');


// export exposable functions and variables
module.exports = {
	checkall : checkall,
    checkRequiredOptionsInExecution	:  checkRequiredOptionsInExecution,
    checkValidityOfPairinExecution : checkValidityOfPairinExecution,
    checkValidityofAddressesInDestinationAndRefund : checkValidityofAddressesInDestinationAndRefund
};


function checkall(program){
	var deferred = Q.defer();
	process.stdout.write(chalk.dim('[' + moment().format('hh:mm:ss a') +']:') + '	validating ..	');
	checkRequiredOptionsInExecution(program)
	.then(checkValidityOfPairinExecution)
	.then(checkValidityofAddressesInDestinationAndRefund)
	.then(function(){
		deferred.resolve(program);
	})
	.catch(function(err){
		deferred.reject(err);
	});
	return deferred.promise;
}

function checkRequiredOptionsInExecution(program){
	var deferred = Q.defer();
	var ParsedPairOne = program.pair.split("_")[0];
	var ParsedPairTwo = program.pair.split("_")[1];
	if( !program.pair || !program.refund || !program.destination ){  //check that all required variables are passed
		deferred.reject('rapidshift called incorrectly, check rapidshift -h for required variables.');
	}
	else if( ( ParsedPairOne.toLowerCase() == 'xmr' || ParsedPairTwo.toLowerCase() == 'xmr' ) && ( !program.extra) ){
		// if monero (xmr) is in play we need payment id passed in the extra option
		deferred.reject('monero exchange requires the paymentID passed in the (--extra, -x) option');
	}
	else{
		process.stdout.write(chalk.bgBlue('	✓	'));
		deferred.resolve(program);

	}
	return deferred.promise;
}

function checkValidityOfPairinExecution(program){
	var deferred = Q.defer();
	shapeshift.marketInfo(program.pair,function(err,marketInfo){
		if(marketInfo.error){
			deferred.reject("error : " + marketInfo.error)
		}
		else if(err){
			deferred.reject(err);
		}
		else{
			process.stdout.write(chalk.bgBlue('	✓	'));
			deferred.resolve(program);
		}
	});
	return deferred.promise;
}


function checkValidityofAddressesInDestinationAndRefund(program){
	var deferred = Q.defer();
	var ParsedPairOne = program.pair.split("_")[0];
	var ParsedPairTwo = program.pair.split("_")[1];
	request
	.get('https://shapeshift.io/validateAddress/' + program.refund + '/' + ParsedPairOne)
	.end(function(err, res){
		if(err){
			deferred.reject(err); // something went wrong in the request to the url
		}
		else if(res.body.error){
			deferred.reject(res.body.error + '	' + program.refund + '	' + ParsedPairOne); // the address did not match the coin symbol
		}
		else{
			request
			.get('https://shapeshift.io/validateAddress/' + program.destination + '/' + ParsedPairTwo)
			.end(function(err, res){
				if(err){
					deferred.reject(err); // something went wrong in the request to the url
				}
				else if(res.body.error){
					deferred.reject(res.body.error + '	' + program.destination + '	' + ParsedPairTwo); // the address did not match the coin symbol
				}
				else{
					process.stdout.write(chalk.bgBlue('	✓	'));
					deferred.resolve();
				}
			});
		}
	});
	return deferred.promise;
}

