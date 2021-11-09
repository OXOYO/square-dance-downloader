import fs from 'fs'
import path from 'path'

export default function renameCopyData(dataPath: string) {
    const fullDataPath = path.resolve(process.cwd(), dataPath);
    const mainfestFile = path.resolve(fullDataPath, 'downloadInfo.json')
    if (!fs.existsSync(mainfestFile)) {
        console.error(`${mainfestFile} not exist`);
        return;
    }
    const mainfest = JSON.parse(fs.readFileSync(mainfestFile).toString('utf-8'))
    const filePaths = fs.readdirSync(fullDataPath);
    filePaths.forEach((fileName)=>{
        const fileFullPath = path.resolve(fullDataPath, fileName);
        const mainfestItem: any = mainfest.list.find(({file}: any) => file === fileName);
        if (mainfestItem &&
            !fs.lstatSync(fileFullPath).isDirectory()) {
            const toName  = fixFileOrDirName(mainfestItem.title)+'.mp4';
            const tagsPath = path.join(...mainfestItem.tags.map((tag: string)=>fixFileOrDirName(tag)));
            const tagsFullPath = path.resolve(fullDataPath, tagsPath);
            const toFullName = path.resolve(tagsFullPath, toName);
            makeDir(tagsFullPath);
            renameFile(fileFullPath, toFullName);
        }
    })
}

export function renameFile(fromName: string,  toName: string) {
    console.log('renameFile', {fromName, toName})
    fs.renameSync(fromName, toName);
}

export function makeDir(dir: string) {
    console.log('makeDir', dir);
    fs.mkdirSync(dir, {recursive: true})
}

export function fixFileOrDirName(name: string) {
    if (!name) {
        return name;
    }
    return name.replace(/[\\\n/:*?"<>|]/g, '');
}

// 将data目录的视频按文件夹归类，重命名为中文
// renameCopyData('H:\\');