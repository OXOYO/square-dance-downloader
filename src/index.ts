import {downloadJingXuan} from "./parser";
import fs from 'fs';
import {getDataPath} from "./util";

fs.mkdirSync(getDataPath(), {recursive: true});

downloadJingXuan().then(()=>{
    console.log('所有视频下载完成');
}, (e)=>{
    console.error('fail', e);
})