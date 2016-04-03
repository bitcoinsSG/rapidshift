const shapeshift = require('shapeshift.io');
const chalk = require('chalk');
const moment = require('moment');


module.exports = {
	mockshapeshiftshift : mockshapeshiftshift,
    mockshapeshiftstatus	:  mockshapeshiftstatus
};

// this function mimicks the output of shapeshift.io function shapeshift.shift for testing
function mockshapeshiftshift(destination, programpair, options, callback){
  var mockreturneddata = { deposit: 'fake-deposit-address',
  depositType: programpair.split("_")[0],
  withdrawal: destination,
  withdrawalType: programpair.split("_")[1],
  public: null,
  apiPubKey: 'shapeshift',
  returnAddress: options.returnAddress,
  returnAddressType: programpair.split("_")[0] 
  };
  callback(null, mockreturneddata);
}



// this function mimicks the output of shapeshift.io function shapeshift.status for testing
var count = 0;
var threshold = 10;
function mockshapeshiftstatus(depositAddress, callback){
	if(count<threshold && count > -1){
		count++;
		callback(null,'no_deposits',{ status: 'no_deposits', address: '0x5abd5a30cb5bf24759c19db1cdc1082dd9c5b618' });
	}
	else if( count > (threshold-1) && count < (threshold*3)){
		count++;
		var receiveddata =  { status: 'received',  address: '1H4vW9wcgr5i6LVsYMTuz449ci7ZWSyX6F', incomingCoin: 50.0345 ,incomingType: 'ETH' };
		callback(null,'received',receiveddata);
	}
	else if( count > ((threshold*3)-1)){
		count = 0;
		var completeddata = { status: 'complete', 
		  address: '0x3d0386fae7d55841cd0613dfa03b8acdf73f4344',
		  withdraw: '1Eqx6khcVVL2UGvWh5pb7yHC6tTLfcP3SU',
		  incomingCoin: 50.0,
		  incomingType: 'ETH',
		  outgoingCoin: '1.345',
		  outgoingType: 'BTC',
		  transaction: '7be3b029d36eaf91ecf5d1474677136396bdb03e2f207f79714f457f5843520e' 
		};

		callback(null,'complete',completeddata);

	}
	else{
		callback("error",null,null);
	}

}