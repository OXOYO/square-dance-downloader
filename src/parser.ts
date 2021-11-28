import axios from 'axios';
import fs from 'fs';
import path from 'path';
import {CODE_SUCCESS, COMMON_HEADERS, fixFileOrDirName, getDataPath, getMd5} from "./util";
import {
    ApiRes,
    DownloadSource,
    DownloadVideoInfo,
    DownProgressCallback,
    JingXuanListItem,
    Video
} from "./api";
import {downloadFile} from "./downloader";
import {ProgressSpinner} from "./ProgressSpinner";
import Url from "url";

async function getVideoUrl(vid: string) {
    const {data} = await axios.request<ApiRes<DownloadSource[]>>({
        method: 'get',
        url: `https://aa.tangdou.com:12308/tv_api.php?mod=tv&ac=mp4&vid=${vid}&time=${Date.now()}&hash=cb02ea1a870717b6f186547a46f0030c`,
        headers: {
            ...COMMON_HEADERS
        }
    });

    if (data.code !== CODE_SUCCESS) {
        console.error('getVideoUrl error', data);
        return;
    }

    return data.datas;
}

function selectVideoUrl(list: DownloadSource[]) {
    return list[0].url;
}

async function getJingXuanMenu() {
    const {data} = await axios.request<ApiRes<JingXuanListItem[]>>({
        method: 'get',
        url: `https://aa.tangdou.com:12308/tv_api.php?mod=tv&ac=playlist_all&time=${Date.now()}&hash=65f25a31c8c2a5ae336bb976bcd6b5da`,
        headers: {
            ...COMMON_HEADERS
        }
    });
    if (data.code !== CODE_SUCCESS) {
        console.error('getJingXuan error', data);
        return;
    }
    return data.datas;
}

async function getJingXuanVList(pid: string) {
    const {data} = await axios.request<ApiRes<Video[]>>({
        method: 'get',
        url: `https://aa.tangdou.com:12308/tv_api.php?mod=tv&ac=playlist_video&page=0&pid=${pid}&time=${Date.now()}&hash=5ae1b471384623008ec8af2ce8841d13`,
        headers: {
            ...COMMON_HEADERS
        }
    });
    if (data.code !== CODE_SUCCESS) {
        console.error('getJingXuan error', data);
        return;
    }
    return data.datas;
}

// const demoVid = '20000000551036';
// getVideoUrl(demoVid).then((result)=>{
//     const url = selectVideoUrl(result);
//     console.log(result);
// })

function genIdByUrl(url: string) {
    const {protocol, host, pathname} = Url.parse(url, true);
    const noQueryUrl = `${protocol}//${host}${pathname}`;
    return getMd5(noQueryUrl);
}

export function mkDirByTags(tags: string[]) {
    const tagsDir = path.join(...tags.map(tag => fixFileOrDirName(tag)).filter(s => s));

    const tagPath = path.resolve(getDataPath(), tagsDir);
    if (!fs.existsSync(tagPath)) {
        fs.mkdirSync(tagPath, {recursive: true});
    }

    return tagsDir;
}

export function getVideoDownloadRePath(url: string, title: string, tags: string[]): string {
    const fileName = fixFileOrDirName(title) + '.mp4';
    return path.join(mkDirByTags(tags), fileName);
}

async function pushDownload(video: Video, tags: string[] = []) {
    const videoInfo: DownloadVideoInfo = {
        tags,
        file: '',
        ...video
    }
    //console.log('pushDownload', video, tags)
    const videoUrlInfo = await getVideoUrl(video.vid)
    if (videoUrlInfo) {
        const videoUrl = selectVideoUrl(videoUrlInfo);
        let filePath = getVideoDownloadRePath(videoUrl,video.title, tags);
        await downloadFile(videoUrl, filePath, {
            progressCallback: getLoadingLoggerCallback(videoInfo)
        });
        videoInfo.file = filePath;
    }
}

const getSpinner = (() => {
    let progressSpinner: ProgressSpinner;
    return () => {
        if (!progressSpinner) {
            progressSpinner = new ProgressSpinner()
        }
        return progressSpinner;
    };
})();

export function getLoadingLoggerCallback(video: DownloadVideoInfo): DownProgressCallback {
    getSpinner().pushItem(video);
    return (event) => {
        const {load, total, error} = event;
        let progressPercent = +(load / total * 100).toFixed(1);
        if (progressPercent >= 100 && load < total) {
            progressPercent = 99.9;
        }
        video._progressPercent = progressPercent;
    };
}

export async function downloadJingXuan() {
    let menu = await getJingXuanMenu()
    let tags = ['精选广场舞'];
    if (menu) {
        if(process.env.NODE_ENV === 'dev') {
            menu = menu.slice(0,1);
        }
        await Promise.all(menu.map(async menuItem => {
            let tag1 = tags.concat([menuItem.title]);
            let videoList = await getJingXuanVList(menuItem.id)
            if (videoList) {
                if(process.env.NODE_ENV === 'dev') {
                    videoList = videoList.slice(0,2);
                }
                await Promise.all(videoList.map(async video => {
                    await pushDownload(video, tag1);
                }));
            }
        }))
        getSpinner().stop();
    }
}

