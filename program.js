(function() {
    var _path = require('path');
    var _request = require('request');
    var _ping = require('ping');

    const CAM_1 = 'Doggo Cam';
    const CAM_2 = 'People (Ellie) Cam';
    const ENABLE_MD = 'Enable motion detection';
    const DISABLE_MD = 'Disable motion detection';

    // Any new IPS must have a manual 'await ping(ip)' function call inside while loop
    const IPS = {
        TOM: '192.168.0.25'
    }

    const PING_CFG = {
        timeout: 2
    }
    const SCAN_INTERVALS = {
        HOME: '5000',
        AWAY: '2000'
    };

    const CONFIG_FOLDER = 'config';
    const CONFIG_FILE = 'assistant_config.json';
    const CONFIG = readJson(_path.resolve(__dirname, CONFIG_FOLDER, CONFIG_FILE));

    // default = away
    var _scanIntervalMs = SCAN_INTERVALS.AWAY;
    var _away = true;

    (async function() {
        while (true) {
            // need to manually ping devices
            var match = await ping(IPS.TOM);

            var res = await sendCommand('how is the weather');
            console.log(res);
        }
    })();

    function sendCommand(command) {
        return new Promise((resolve, reject) => {
            var reqOptions = {
                url: buildUrl(command),
                headers: {
                    [CONFIG.AUTH.KEY]: CONFIG.AUTH.VALUE
                }
            }

            // send the request
            _request(reqOptions, (err, res, body) => {
                if (err)
                    reject(err);
                // send response body
                resolve(body);
            });

            function buildUrl(command) {
                return CONFIG.ADDRESS + '/' + CONFIG.ENDPOINT + '/' + encodeURI(command);
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