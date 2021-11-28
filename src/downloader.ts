import fs from 'fs';
import {aixosInstance, getDataPath} from "./util";
import {DownProgressCallback} from "./api";
import {AxiosError, AxiosRequestConfig, AxiosResponseHeaders} from "axios";
import path from "path";

export async function getHeadersInfo(url: string) {
    let config: AxiosRequestConfig<void> = {
        method: 'head',
        url
    };
    const response = await aixosInstance.request<void>(config);
    return response.headers;
}

export function getContentLengthFromHeaders(headers: AxiosResponseHeaders): number {
    return +(headers['Content-Length'] || headers['content-length'] || -1);
}

export async function preFetchVideoSize(url: string) {
    let headers = await getHeadersInfo(url);
    return getContentLengthFromHeaders(headers);
}

export async function downloadFile(url: string, filePath: string, options?: {
    force?: boolean;
    progressCallback?: DownProgressCallback
}): Promise<void> {
    filePath = path.resolve(getDataPath(), filePath);
    let mergedOptions = Object.assign({
        force: false
    }, options);
    let config: AxiosRequestConfig<fs.ReadStream> = {
        method: 'get',
        url,
        headers: {},
        responseType: "stream",
    };
    let contentLength = Infinity;
    const updateProgress = (load: number, error = false) => {
        mergedOptions.progressCallback && mergedOptions.progressCallback({
            load,
            total: contentLength,
            error,
        })
    }
    let startDownRangeStart = 0;
    if (!mergedOptions.force && fs.existsSync(filePath)) {
        contentLength = await preFetchVideoSize(url);
        const {size} = fs.statSync(filePath);
        startDownRangeStart = size;
        if (contentLength && size >= contentLength) {
            // console.log(`${url} 已经下载：${filePath}`);
            updateProgress(contentLength);
            // TODO close 
            return;
        }
    }
    if (startDownRangeStart > 0) {
        config.headers!['Range'] = `bytes=${startDownRangeStart}-`;
    }
    const {data, headers} = await aixosInstance.request<fs.ReadStream>(config);
    contentLength = getContentLengthFromHeaders(headers);
    const pr = new Promise<void>((resolve, reject) => {
        let loadSize = 0;
        const resolveTruth = () => {
            updateProgress(contentLength);
            resolve()
        };
        const rejectTruth = (e: AxiosError) => {
            updateProgress(loadSize, true);
            reject()
        };
        data.on('error', rejectTruth);
        data.on('end', resolveTruth);
        data.on('finish', resolveTruth);
        if (mergedOptions.progressCallback) {
            data.on('data', chunk => {
                loadSize += chunk.length;
                mergedOptions.progressCallback && mergedOptions.progressCallback({
                    load: loadSize,
                    total: contentLength
                })
            })
        }
    });
    const writeFileStream = fs.createWriteStream(filePath, {flags: 'a'});
    data.pipe(writeFileStream);
    return pr;
}



