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

    const SCAN_WAIT_MS = 2000;
    const PING_TIMEOUT_S = 2;

    // IPs must be static
    const IPS = {
        TOM: '192.168.0.25',
        NATH: '192.168.0.26'
    }

    var _away;

    // main
    (async function(init) {
        var commands;
        while (true) {
            // check for a device match
            var match = await pingAll();

            console.log('Status:', init ? 'Init' : _away ? 'Away' : 'Home');
            if (match && _away) {
                // someone just came home
                _away = false;
                commands = [
                    DISABLE_MD + ' on ' + CAM_1,
                    DISABLE_MD + ' on ' + CAM_2
                ]

                // send commands
                await sendCommands(commands);
            }
            else if (init || (!match && !_away)) {
                if (init)
                    init = false;

                // everyone is away
                _away = true;
                commands = [
                    ENABLE_MD + ' on ' + CAM_1,
                    ENABLE_MD + ' on ' + CAM_2
                ]

                // send commands
                await sendCommands(commands);
            }

            await wait(SCAN_WAIT_MS);
        }
    })(true);

    function wait(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    function sendCommands(commandArr) {
        if (!Array.isArray(commandArr))
            commandArr = [commandArr];

        // build promises to send each command
        var promiseArr = commandArr.map((command) => {
            return new Promise((resolve, reject) => {
                var reqOptions = {
                    url:ASSISTANT_CONFIG.ADDRESS + '/' + ASSISTANT_CONFIG.ENDPOINT + '/' + encodeURI(command),
                    headers: {
                        [ASSISTANT_CONFIG.AUTH.KEY]: ASSISTANT_CONFIG.AUTH.VALUE
                    }
                }

                _request(reqOptions, (err, res, body) => {
                    if (err)
                        reject(err);

                    resolve(body);
                });
            });
        });

        return new Promise((resolve, reject) => {
            // wait for all promises to resolve
            Promise.all(promiseArr).then((resolveArr) => {
                resolveArr.forEach((res) => {
                    console.log(res);
                });

                resolve();
            }).catch((err) => {
                // TODO: better error handing
                console.log('Error:', err.message, '. Command(s) not sent.');
                resolve();
            });
        });
    }

    function pingAll() {
        var match = false;
        var pingCfg = {
            timeout: PING_TIMEOUT_S
        }

        // build promises to ping each IP
        var promiseArr = Object.keys(IPS).map((i) => {
            return new Promise((resolve, reject) => {
                var ip = IPS[i];
                // ping the ip and resolve
                _ping.sys.probe(ip, (alive) => {
                    if (alive)
                        match = alive;
                    resolve();
                }, pingCfg);
            });
        });

        return new Promise((resolve, reject) => {
            // wait for all ping promises to resolve
            Promise.all(promiseArr).then(() =>{
                // resolve match
                resolve(match);
            });
        })
    }

    function readJson(filePath) {
        var fs = require('fs');
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
})();