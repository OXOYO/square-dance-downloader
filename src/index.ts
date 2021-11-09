import {downloadJingXuan} from "./parser";
import fs from 'fs';
import {PATH_DATA} from "./util";

fs.mkdirSync(PATH_DATA, {recursive: true});

downloadJingXuan().then(()=>{
    console.log('所有视频下载完成');
}, (e)=>{
    console.error('fail', e);
})