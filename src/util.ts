import {AxiosRequestHeaders} from "axios";
import path from 'path';
import https from "https";
import axios from 'axios';
import crypto from "crypto";
import fs from "fs";

export const COMMON_HEADERS: AxiosRequestHeaders = {
    'Host': 'aa.tangdou.com:12308',
    'User-Agent': 'okhttp/3.6.0'
};

export const CODE_SUCCESS = '0';

export function getDataPath(){
    if(process.env.NODE_ENV === 'dev') {
        let devDataPath = path.resolve(__dirname, '..', 'data');
        if (!fs.existsSync(devDataPath)) {
            fs.mkdirSync(devDataPath, {recursive: true});
        }
        return path.resolve(__dirname, '..', 'data');
    }
    return process.cwd();
}

export const aixosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

export function getMd5(data: string) {
    let hash = crypto.createHash('md5');
    return hash.update(data).digest('hex');
}

export function fixFileOrDirName(name: string) {
    if (!name) {
        return name;
    }
    return name.replace(/[\\\n/:*?"<>|]/g, '');
}