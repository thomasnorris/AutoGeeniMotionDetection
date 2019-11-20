(function() {
    var _path = require('path');
    var _request = require('request');
    var _scan = require('local-devices');

    const CAM_1 = 'Doggo Cam';
    const CAM_2 = 'People (Ellie) Cam';
    const ENABLE_MD = 'Enable motion detection';
    const DISABLE_MD = 'Disable motion detection';
    // MACs can be uppercase, lowercase, - or : delimited
    const MACS = [
        'CC:C0:79:F1:8F:47',
        'CC:C0:79:83:5B:18'
    ];
    // milliseconds
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

    (function startScanning(init = false) {
        _scan().then((devices) => {
            var match = devices.some((device) => {
                return checkMatch(device);
            });

            console.log('Done scanning', devices.length, 'devices.' , match ? 'Found' : 'No', 'match!');
            if (match && _away) {
                // someone just came home
                sendCommand('What time is it?');
                //sendCommand(DISABLE_MD + ' on ' + CAM_1);
                //sendCommand(DISABLE_MD + ' on ' + CAM_2);
                _scanIntervalMs = SCAN_INTERVALS.HOME;
                _away = false;
            } else if (init || (!match && !_away)) {
                // everyone just left
                sendCommand('How is the weather today?');
                //sendCommand(ENABLE_MD + ' on ' + CAM_1);
                //sendCommand(ENABLE_MD + ' on ' + CAM_2);
                _scanIntervalMs = SCAN_INTERVALS.AWAY;
                _away = true;
            }

            setTimeout(() => {
                startScanning();
            }, _scanIntervalMs);

            function checkMatch(device) {
                var mac = device.mac;
                // check for combinations of upper/lowercase/- or : delimited addresses
                return MACS.includes(mac.toUpperCase())
                    || MACS.includes(mac.toLowerCase())
                    || MACS.includes(mac.toUpperCase().split(':').join('-'))
                    || MACS.includes(mac.toLowerCase().split(':').join('-'))
                    || MACS.includes(mac.toUpperCase().split('-').join(':'))
                    || MACS.includes(mac.toLowerCase().split('-').join(':'));
            }
        });
    })(true);

    function scan(cb) {
        // see https://nodejs.org/api/child_process.html#child_process_child_process
        var { spawn } = require('child_process');
        var arp = spawn('arp', ['-a']);

        arp.stdout.on('data', (data) => {
            // there must be at least 1 match
            cb(data.toString().split(' ').filter((el) => {
                return checkMatch(el);
            }).length !== 0);
        });

        arp.stderr.on('data', (data) => {
            // TODO: logging
        });


    }

    function sendCommand(command) {
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