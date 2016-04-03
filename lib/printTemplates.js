const chalk = require('chalk');
const moment = require('moment');

// export exposable functions and variables
module.exports = {
	printTimeStamp : printTimeStamp,
	printHashes : printHashes
};


function printTimeStamp(){
	return chalk.dim('[' + moment().format('hh:mm:ss a') +']	');
}

function printHashes(){
	return chalk.dim("################################################################################################");
}