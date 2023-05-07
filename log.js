import {Fritz} from 'fritzdect-aha-nodejs';
import * as dotenv from 'dotenv';
import {writeFileSync} from 'fs';

let config = dotenv.config() || {};

let {USERNAME = '', PASSWORD = '', URL = ''} = ((config || {}).parsed || {});
const fritz = new Fritz(USERNAME, PASSWORD, URL, false);

const process = function () {
    return {
        data: [],
        add: function (message = '', data = null, status = 'info') {
            this.data.push({
                time: new Date().toISOString(),
                data, message, status
            })
        },
        write: function () {
            let name = 'fritz-log_' + new Date().getTime();
            let ending = '.json';
            writeFileSync('logs/' + name + ending, JSON.stringify(this.data, undefined, 4));
        }
    }
}

function fetchAndLog() {

    let loginError = false;
    let p = process();

    return fritz.login_SID()
        .catch((e) => {
            loginError = true;
        })
        .then(() => {
            p.add('login', undefined, loginError ? 'error' : 'success');
            return !loginError;
        })
        .then((canFetchDevices) => {
            return canFetchDevices ? fritz.getDeviceListInfos() : '';
        })
        .then((devicesXmlString) => {
            p.add('devices', devicesXmlString, devicesXmlString.length ? 'success' : 'error');
            return devicesXmlString;
        })
        .then(() => {
            return fritz.logout_SID();
        })
        .then(function (response) {
            p.add('logout');
        })
        .catch((e) => {
            // TODO
        })
        .finally(() => {
            p.write();
        });

}

fetchAndLog();
