## Prerequisites
### NPM and Node.js
- Both of these are required and can be downloaded [here](https://github.com/nodesource/distributions).
    - If using a Raspberry Pi Zero W, follow [these](https://www.thepolyglotdeveloper.com/2018/03/install-nodejs-raspberry-pi-zero-w-nodesource/) instructions instead.
### Geeni
- Geeni is connected to the Google Assistant.
- The cameras are named the same as in `program.js`.
    - This can be done through the Google Home app or the Geeni app.
### Google Assistant Server
- [REST-GoogleAssistant](https://github.com/thomasnorris/REST-GoogleAssistant) must be set up and operational.
    - Take note of:
        - The port that the server is listening on.
            - Make sure that the port is forwarded.
        - The `auth.json` with the header key/value
            - Both of these will be needed to authenticate.
## Installation
- Everything in the __Prerequisites__ section must be done first!
- After cloning:
    - Run `npm install` to install packages.
    - Run `node program.js` to start.
- Optionally, add the following line to `/etc/rc.local` for auto startup:
    - `sudo node "/PATH/TO/REPO/program.js"`.