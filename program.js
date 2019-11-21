(function() {
    var _path = require('path');
    var _request = require('request');
    var _ping = require('ping');

    const CONFIG_FOLDER = 'config';
    const ASSISTANT_CONFIG_FILE = 'assistant_config.json';
    const ASSISTANT_CONFIG = readJson(_path.resolve(__dirname, CONFIG_FOLDER, ASSISTANT_CONFIG_FILE));

    const CAM_1 = 'Doggo Cam';
    const CAM_2 = 'People (Ellie) Cam';
    const ENABLE_MD = 'Enable motion detection';
    const DISABLE_MD = 'Disable motion detection';

    const SCAN_INTERVAL = 2000;
    const PING_CFG = {
        timeout: 2
    }

    // IPs must be static
    // Any new IPS must have a manual 'await ping(ip);' function call
    const IPS = {
        TOM: '192.168.0.25'
    }

    // default = away
    var _away;

    (async function(init) {
        while (true) {
            // need to manually ping devices
            var match = await ping(IPS.TOM);

            console.log('Match:', match);
            console.log('Status:', _away ? 'Away' : 'Home');
            if (match && _away) {
                // someone just came home
                await sendCommand(DISABLE_MD + ' on ' + CAM_1).then((res) => {
                    console.log(res);
                });
                await sendCommand(DISABLE_MD + ' on ' + CAM_2).then((res) => {
                    console.log(res);
                });

                _away = false;
            }
            else if (init || (!match && !_away)) {
                if (init)
                    init = false;

                // everybody just left home
                await sendCommand(ENABLE_MD + ' on ' + CAM_1).then((res) => {
                    console.log(res);
                });
                await sendCommand(ENABLE_MD + ' on ' + CAM_2).then((res) => {
                    console.log(res);
                });

                _away = true;
            }

            await wait(SCAN_INTERVAL);
        }
    })(true);

    function wait(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    function sendCommand(command) {
        return new Promise((resolve, reject) => {
            var reqOptions = {
                url: buildUrl(command),
                headers: {
                    [ASSISTANT_CONFIG.AUTH.KEY]: ASSISTANT_CONFIG.AUTH.VALUE
                }
            }

            _request(reqOptions, (err, res, body) => {
                if (err)
                    reject(err);

                resolve(body);
            });

            function buildUrl(command) {
                return ASSISTANT_CONFIG.ADDRESS + '/' + ASSISTANT_CONFIG.ENDPOINT + '/' + encodeURI(command);
            }
        });
    }

    function ping(ip) {
        return new Promise((resolve, reject) => {
            _ping.sys.probe(ip, (alive) => {
                resolve(alive);
            }, PING_CFG);
        });
    }

    function readJson(filePath) {
        var fs = require('fs');
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
})();