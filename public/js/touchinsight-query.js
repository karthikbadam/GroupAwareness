function Query (options) {
    
    var _self = this;
    
    _self.index = options.index; 
    
    _self.operator = options.operator; //"range", "equal", "in"    
    
    _self.logic = options.logic;
    
    _self.value = options.value;
 
}

Query.prototype.getQueryString = function () {
    
    var _self = this; 
    
    var data = {};
    
    data.index = _self.index;
    
    data.operator = _self.operator;
    
    data.logic = _self.logic; 
    
    data.value = _self.value;
    
    return data;
}