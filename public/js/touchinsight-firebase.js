function Sync(options) {

    var _self = this;

    var queryRef = _self.queryRef = new
    Firebase('touchsurvey.firebaseIO.com');
    
    //queryRef.remove();

    queryRef.on('child_added',
        function (snapshot) {
            //GET DATA

            var data = JSON.parse(JSON.stringify(snapshot.val()));
        
            //options.callback(counter);

        });
}

Sync.prototype.push = function (content) {

    var _self = this;

    var data = {};

    data.content = content;

    data.device = device;
    
    //data.pID = participantID;
    
    data.timeStamp = Date.now();

    _self.queryRef.push(data);
    
}