const chalk = require('chalk');
const moment = require('moment');

// export exposable functions and variables
var printTemplate = module.exports ={
	printTimeStamp : printTimeStamp,
	printHashes : printHashes,
	mock : false
};


function printTimeStamp(){
	var returnedValue = (printTemplate.mock) ? chalk.cyan('[' + moment().format('HH:mm:ss') +']  ') : chalk.dim('[' + moment().format('HH:mm:ss') +']  ');
	return returnedValue;
}

function printHashes(){
	var returnedValue = (printTemplate.mock) ? chalk.cyan(('#').repeat(100)) : chalk.dim(('#').repeat(100));
	return returnedValue;
}