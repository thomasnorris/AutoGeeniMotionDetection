(function() {
    var _path = require('path');
    var _request = require('request');
    var _ping = require('ping');

    const CONFIG_FOLDER = 'config';
    const ASSISTANT_CONFIG_FILE = 'assistant_config.json';
    const ASSISTANT_CONFIG = readJson(_path.resolve(__dirname, CONFIG_FOLDER, ASSISTANT_CONFIG_FILE));

    const CAM_1 = 'People (Ellie) Cam';
    const CAM_2 = 'Doggo Cam';
    const ENABLE_MD = 'Enable motion detection';
    const DISABLE_MD = 'Disable motion detection';

    const SCAN_WAIT_MS = 2000;
    const PING_TIMEOUT_S = 2;

    // IPs must be static, set at router level
    const IPS = {
        TOM: '192.168.0.25',
        NATH: '192.168.0.26'
    }

    var _away;

    // main
    (async function(init) {
        while (true) {
            // check for a device match
            var match = await pingAll();

            console.log('Status:', init ? 'Init' : _away ? 'Away' : 'Home');

            // someone just came home
            if (match && _away) {
                await sendCommands([
                    DISABLE_MD + ' on ' + CAM_1,
                    DISABLE_MD + ' on ' + CAM_2
                ]).then((dataArr) => {
                    // only change status on success
                    _away = false;
                }).catch((err) => {
                    // TODO: better error handing
                    console.log('Error:', err.message, '. Command(s) not sent.');
                });
            }

            // everyone is away or init
            else if (init || (!match && !_away)) {
                if (init)
                    init = false;

                await sendCommands([
                    ENABLE_MD + ' on ' + CAM_1,
                    ENABLE_MD + ' on ' + CAM_2
                ]).then((dataArr) => {
                    // only change status on success
                    _away = true;
                }).catch((err) => {
                    // TODO: better error handing
                    console.log('Error:', err.message, '. Command(s) not sent.');
                });
            }

            // only have to wait if someone is home because scanning all devices when
            // no one is home introduces a delay
            if (!_away)
                await wait(SCAN_WAIT_MS);
        }
    })(true);

    function wait(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    function sendCommands(commandArr) {
        // if a single command is passed, convert to array
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

                console.log('Sending command: ', command);

                _request(reqOptions, (err, res, body) => {
                    if (err)
                        reject(err);
                    else
                        resolve(body);
                });
            });
        });

        return new Promise((resolve, reject) => {
            Promise.all(promiseArr).then((resolveArr) => {
                // all requests have been sent, exit
                resolve(resolveArr);
            }).catch((err) => {
                // at least one request failed, exit
                reject(err);
            });
        });
    }

    function pingAll() {
        var pingCfg = {
            timeout: PING_TIMEOUT_S
        }

        // build promises to ping each IP
        var promiseArr = Object.keys(IPS).map((i) => {
            return new Promise((resolve, reject) => {
                var ip = IPS[i];
                // ping the ip and resolve
                _ping.sys.probe(ip, (alive) => {
                    // if alive, reject to prevent pinging other devices
                    if (alive)
                        reject();

                    // no match, resolve false and ping next device
                    resolve();
                }, pingCfg);
            });
        });

        return new Promise((resolve, reject) => {
            // wait for all ping promises to resolve
            Promise.all(promiseArr).then(() =>{
                // no device was found
                resolve(false);
            }).catch(() => {
                // a device was found, so the rest were skipped
                resolve(true);
            });
        })
    }

    function readJson(filePath) {
        var fs = require('fs');
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
})();