(function() {
    var _path = require('path');
    var _request = require('request');

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
        scan((match) => {
            console.log('Done scanning.', match ? 'Found' : 'No', 'match!');
            if (match && _away) {
                // someone just came home
                console.log('Disabling motion detection.');
                sendCommand('What time is it?');
                //sendCommand(DISABLE_MD + ' on ' + CAM_1);
                //sendCommand(DISABLE_MD + ' on ' + CAM_2);
                _scanIntervalMs = SCAN_INTERVALS.HOME;
                _away = false;
            } else if (init || (!match && !_away)) {
                // everyone just left
                console.log('Enabling motion detection.');
                sendCommand('How is the weather today?');
                //sendCommand(ENABLE_MD + ' on ' + CAM_1);
                //sendCommand(ENABLE_MD + ' on ' + CAM_2);
                _scanIntervalMs = SCAN_INTERVALS.AWAY;
                _away = true;
            }

            setTimeout(() => {
                startScanning();
            }, _scanIntervalMs);
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

        function checkMatch(el) {
            // check for combinations of upper/lowercase, space or colon delimited addresses
            return MACS.includes(el.toUpperCase())
                || MACS.includes(el.toLowerCase())
                || MACS.includes(el.toUpperCase().split(':').join('-'))
                || MACS.includes(el.toLowerCase().split(':').join('-'))
                || MACS.includes(el.toUpperCase().split('-').join(':'))
                || MACS.includes(el.toLowerCase().split('-').join(':'));
        }
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