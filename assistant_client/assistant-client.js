// REST-GoogleAssistant must be operational
// see config_template.json for config structure
// request must be installed via 'npm install request'
var _request = require('request');
var _path = require('path');

const CFG = readJson(_path.resolve(__dirname, 'config.json'));

var _outerFunc = module.exports = {
    Send: function(commands) {
        // if a single command is passed, convert to array
        if (!Array.isArray(commands))
            commands = [commands];

            // build promises to send each command
            var promiseArr = commands.map((command) => {
            return new Promise((resolve, reject) => {
                var reqOptions = {
                    url:CFG.ADDRESS + '/' + CFG.ENDPOINT + '/' + encodeURI(command),
                    headers: {
                        [CFG.AUTH.KEY]: CFG.AUTH.VALUE
                    }
                }

                console.log('Sending command: ', command);

                _request(reqOptions, (err, res, body) => {
                    if (err) {
                        console.log('Error:', err);
                        reject(err);
                    }
                    else if (body) {
                        console.log('Response:', body);
                        resolve(body);
                    }
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
}

function readJson(filePath) {
    var fs = require('fs');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}