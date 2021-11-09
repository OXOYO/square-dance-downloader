import {AxiosRequestHeaders} from "axios";
import path from 'path';
import https from "https";
import axios from 'axios';

export const COMMON_HEADERS: AxiosRequestHeaders = {
    'Host': 'aa.tangdou.com:12308',
    'User-Agent': 'okhttp/3.6.0'
};

export const CODE_SUCCESS = '0';

export const PATH_DATA = path.resolve(__dirname, '..', 'data');
export const FILE_DOWNLOAD_INFO = 'downloadInfo.json';

export const aixosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});