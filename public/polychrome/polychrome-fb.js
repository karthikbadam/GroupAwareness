function Sync(options) {

    var _self = this;

    var queryRef = _self.queryRef = new
    Firebase('groupawareness.firebaseIO.com');

    queryRef.on('child_added',
        function (snapshot) {
            //GET DATA

            var data = JSON.parse(JSON.stringify(snapshot.val()));

            if (+data.time > startTime &&
                deviceId != data.deviceId) {

                options.callback(data.query,
                    data.time, data.deviceType, data.deviceId);

            }

        });
}

Sync.prototype.push = function (query) {

    var _self = this;

    var data = {};

    data.query = query;

    data.time = Date.now();

    data.deviceType = device;

    data.deviceId = deviceId;

    _self.queryRef.push(data);
}