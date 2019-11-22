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
    - Also download the `node_client` folder.
- Take note of:
    - The port that the server is listening on.
        - Make sure that the port is forwarded.
    - The public address of the server.
    - The `config/auth.json` file.
## Installation
- Everything in the __Prerequisites__ section must be done first!
- After cloning:
    - In the `config` folder:
        - Copy `assistant_config_template.json` and rename to `assistant_config.json`.
        - Fill in the required information.
            - The header key/value pair from `config/auth.json` __must__ be used.
    - In the `root` directory:
        - Copy the `node_client` folder here and follow the [setup instructions](https://github.com/thomasnorris/REST-GoogleAssistant#nodejs-client)
        - Run `npm install` to install packages.
            - Also run `npm rebuild` if instructed to do so.
        - Run `node program.js` to start.
- Optionally, add the following line to `/etc/rc.local` for auto startup:
    - `sudo node "/PATH/TO/REPO/program.js"`.