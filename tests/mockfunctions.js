const shapeshift = require('shapeshift.io');
const chalk = require('chalk');
const moment = require('moment');


module.exports = {
	mockshapeshiftshift : mockshapeshiftshift,
    mockshapeshiftstatus	:  mockshapeshiftstatus
};

// this function mimicks the output of shapeshift.io function shapeshift.shift for testing
function mockshapeshiftshift(destination, programpair, options, callback){
  var mockreturneddata = { deposit: 'FAKE_5a30cb5bf24759c19db1cdc1082',
  depositType: programpair.split("_")[0],
  withdrawal: destination,
  withdrawalType: programpair.split("_")[1],
  public: null,
  sAddress : 'FAKE_iL57i2XfSDTJ3PbLPRbd8daFc6ShUGiNVBikF4Q5388bdb2c3wmiD7QM9sqU6jiRa53X', // for monero
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
		var receiveddata =  { status: 'received',  address: '1H4vW9wcgr5i6LVsYMTuz449ci7ZWSyX6F', incomingCoin: 0.1 ,incomingType: 'XMR' };
		callback(null,'received',receiveddata);
	}
	else if( count > ((threshold*3)-1)){
		count = 0;
		var completeddata = { status: 'complete', 
		  address: 'FAKE_386faeJ3PbLPRbd8daFc6S7d55841cd0613dfa03b8acdf73f4J3PbLPRbd8daFc6S344',
		  withdraw: 'FAKE_5a305a30cb5gh483jsdj23jwerus986564gfdgfcb5',
		  incomingCoin: 0.1,
		  incomingType: 'XMR',
		  outgoingCoin: '0.0148714',
		  outgoingType: 'ETH',
		  transaction: 'FAKE_0x5abd5a30cb5bf24759c19db1cdc1082dd9c' 
		};

		callback(null,'complete',completeddata);

	}
	else{
		callback("error",null,null);
	}

}