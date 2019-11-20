(function() {
    var _path = require('path');
    var _request = require('request');
    var _ping = require('ping');

    const CAM_1 = 'Doggo Cam';
    const CAM_2 = 'People (Ellie) Cam';
    const ENABLE_MD = 'Enable motion detection';
    const DISABLE_MD = 'Disable motion detection';

    // IPs must be static
    const IPS = [
        '192.168.24.139'
    ]

    // todo: change to ping timeout
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

    (function run(init = false) {
        var match;
        IPS.forEach((ip) => {
            _ping.sys.probe(ip, (alive) => {
                match = alive;
            }, {
                timeout: 2
            });
        });

        setTimeout(() => {
            console.log('Match:', match);
            console.log('Status:', _away ? 'Away' : 'Home');
            if (match && _away) {
                // someone just came home
                sendCommand('What time is it?', (res) => {
                    _scanIntervalMs = SCAN_INTERVALS.HOME;
                    _away = false;
                });
                //sendCommand(DISABLE_MD + ' on ' + CAM_1);
                //sendCommand(DISABLE_MD + ' on ' + CAM_2);
            } else if (init || (!match && !_away)) {
                // everyone just left
                sendCommand('How is the weather today?', (res) => {
                    _scanIntervalMs = SCAN_INTERVALS.AWAY;
                    _away = true;
                });
                //sendCommand(ENABLE_MD + ' on ' + CAM_1);
                //sendCommand(ENABLE_MD + ' on ' + CAM_2);
            }
            run();
        }, _scanIntervalMs);

    })(true);

    function sendCommand(command, cb) {
        var reqOptions = {
            url: buildUrl(command),
            headers: {
                [CONFIG.AUTH.KEY]: CONFIG.AUTH.VALUE
            }
        }

        // send the request
        _request(reqOptions, (err, res, body) => {
            // TODO: Logging or something
            console.log('Response:', body);
            cb(body);
        });

        function buildUrl(command) {
            return CONFIG.ADDRESS + '/' + CONFIG.ENDPOINT + '/' + encodeURI(command);
        }
    }

    function readJson(filePath) {
        var fs = require('fs');
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
})();