const Q = require('q');
const shapeshift = require('shapeshift.io');
const request = require('superagent');
const chalk = require('chalk');
const moment = require('moment');
const printTemplates = require('../lib/printTemplates');

// export exposable functions and variables
module.exports = {
	checkall : checkall,
    checkRequiredOptionsInExecution	:  checkRequiredOptionsInExecution,
    checkValidityOfPairinExecution : checkValidityOfPairinExecution,
    checkValidityofAddressesInDestinationAndRefund : checkValidityofAddressesInDestinationAndRefund
};


function checkall(program){
	var deferred = Q.defer();
	Q.all([ // start functions asyncly, but wait for all completion till next step.
		//checkRequiredOptionsInExecution(program),
		checkValidityOfPairinExecution(program),
		checkValidityofAddressesInDestinationAndRefund(program),
		checkMinimumOptionValue(program)
	])
	.then(function(){
		deferred.resolve(program);
	})
	.catch(function(err){
		deferred.reject(err);
	});
	return deferred.promise;
}

function checkMinimumOptionValue(program){
	var deferred = Q.defer();
	if(program.minimum){
		if (typeof program.minimum == "number" || !isNaN(parseFloat(program.minimum))) {
			deferred.resolve();
		}
		else{
			deferred.reject('value entered in --minimum option is not valid.')
		}
	}
	else{
		deferred.resolve();
	}
	return deferred.promise;
}

function checkRequiredOptionsInExecution(program){
	var deferred = Q.defer();
	if( !program.pair || !program.refund || !program.destination ){  //check that all required variables are passed
		deferred.reject('rapidshift called incorrectly, check rapidshift -h for required variables.');
	}
	else{
		process.stdout.write('.');
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
			process.stdout.write('.');
			deferred.resolve(program);
		}
	});
	return deferred.promise;
}


function checkValidityofAddressesInDestinationAndRefund(program){
	var deferred = Q.defer();
	var ParsedPairOne = program.pair.split("_")[0].toLowerCase();
	var ParsedPairTwo = program.pair.split("_")[1].toLowerCase();
	Q.all([
		checkValidityofAddress(program.refund,ParsedPairOne),
		checkValidityofAddress(program.destination,ParsedPairTwo)
	]).then(function(){
		deferred.resolve();
	}).catch(function(error){
		deferred.reject(error);
	});
	return deferred.promise;
}

function checkValidityofAddress(address,symbol){
	var deferred = Q.defer();
	request
	.get('https://shapeshift.io/validateAddress/' + address + '/' + symbol)
	.end(function(err, res){
		if(err){
			deferred.reject(err); // something went wrong in the request to the url
		}
		else if(res.body.error){
			deferred.reject(res.body.error + '	' + address + '	' + symbol); // the address did not match the coin symbol
		}
		else{
			process.stdout.write('.');
			deferred.resolve();
		}
	});
	return deferred.promise;
}