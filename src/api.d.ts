// api 通用结构
export interface ApiRes<T> {
    code: string;
    datas: T;
}

// 下载源
export interface DownloadSource {
    cdn_source: string;
    url: string;
}

// 精选
export interface JingXuanListItem {
    id: string;
    pic: string;
    title: string;
}

// 精选
export interface Video {
    vid: string;
    pic: string;
    title: string;
    createtime: string
}

export interface DownloadVideoInfo extends Video{
    file: string;
    tags: string[];
    _progressPercent?: number,
}


export interface DownloadInfoData {
    list: DownloadVideoInfo[]
}

export interface ProgressEvent  {
    load: number;
    total: number;
    error?: boolean
}
export type DownProgressCallback = (event: ProgressEvent) => void;