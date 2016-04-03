module.exports = {
	merge_options  : merge_options,
	precision : precision
};


function precision(){
	return 6;
}

function merge_options(obj1,obj2){
	// create a merged obj3 with attributed for both obj1 and obj2, but overwrite obj1 values with obj2 if common
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}