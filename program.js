(function() {
    var _path = require('path');
    var _scan = require('local-devices');

    const CAM_1 = 'Doggo Cam';
    const CAM_2 = 'People (Ellie) Cam';
    const ENABLE_MD = 'Enable motion detection';
    const DISABLE_MD = 'Disable motion detection';
    // MACs should be cupper case
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

    const SETTINGS = readJson(_path.resolve(__dirname, CONFIG_FOLDER, CONFIG_FILE));

    // default = away
    var _scanIntervalMs = SCAN_INTERVALS.AWAY;
    var _away = true;

    (function startScanning(init = false) {
        _away ? console.log('Away') : console.log('Home');

        _scan().then((devices) => {
            console.log('Scanned', devices.length, 'devices.');
            var match = devices.some((device) => {
                return MACS.includes(device.mac.toUpperCase());
            });

            if (match && _away) {
                // someone just came home
                sendCommand(DISABLE_MD + ' on ' + CAM_1);
                sendCommand(DISABLE_MD + ' on ' + CAM_2);
                _scanIntervalMs = SCAN_INTERVALS.HOME;
                _away = false;
            } else if (init || (!match && !_away)) {
                // everyone just left
                sendCommand(ENABLE_MD + ' on ' + CAM_1);
                sendCommand(ENABLE_MD + ' on ' + CAM_2);
                _scanIntervalMs = SCAN_INTERVALS.AWAY;
                _away = true;
            }

            setTimeout(() => {
                startScanning();
            }, _scanIntervalMs);
        });
    })(true);

    function sendCommand(command) {

    }

    function readJson(filePath) {
        var fs = require('fs');
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
})();