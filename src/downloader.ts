import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Url from 'url';
import {aixosInstance, PATH_DATA} from "./util";
import {DownProgressCallback} from "./api";
import {AxiosError} from "axios";

function getMd5(data: string) {
    let hash = crypto.createHash('md5');
    return hash.update(data).digest('hex');
}

function genNameByUrl(url: string) {
    const {protocol, host,pathname} = Url.parse(url, true);
    const noQueryUrl = `${protocol}//${host}${pathname}`;
    return getMd5(noQueryUrl);
}

export async function downloadFile(url: string, options?: {
    force?: boolean;
    progressCallback?: DownProgressCallback
}) {
    let fixedOptions = Object.assign({
        force: false
    }, options);
    const name = genNameByUrl(url);
    const fileName = name + '.mp4';
    const filePath = path.resolve(PATH_DATA, fileName);

    const {data, headers} = await aixosInstance.request<fs.ReadStream>({
        method: 'get',
        url,
        responseType: "stream",
    });
    const contentLength = +headers['content-length'];
    const updateProgress = (load: number, error = false)=>{
        fixedOptions.progressCallback && fixedOptions.progressCallback({
            load,
            total: contentLength,
            error,
        })
    }
    if (!fixedOptions.force && fs.existsSync(filePath)) {
        const {size} = fs.statSync(filePath)
        if (contentLength && size >= contentLength) {
            // console.log(`${url} 已经下载：${filePath}`);
            updateProgress(contentLength);
            // TODO close 
            return fileName;
        }
    }
    const pr = new Promise<string>((resolve, reject) => {
        let loadSize = 0;
        const resolveTruth = () => {
            updateProgress(contentLength);
            resolve(fileName)
        };
        const rejectTruth = (e: AxiosError) => {
            updateProgress(loadSize, true);
            reject()
        };
        data.on('error', rejectTruth);
        data.on('end', resolveTruth);
        data.on('finish', resolveTruth);
        if (fixedOptions.progressCallback) {
            data.on('data', chunk=>{
                loadSize += chunk.length;
                fixedOptions.progressCallback && fixedOptions.progressCallback({
                    load: loadSize,
                    total: contentLength
                })
            })
        }
    });
    const writeFileStream = fs.createWriteStream(filePath);
    data.pipe(writeFileStream);
    return pr;
}



