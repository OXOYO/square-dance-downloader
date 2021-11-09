import {downloadFile} from "../../downloader";

describe('download', () => {
    it('downloadFile', async () => {
        const demoUrl = 'https://acctv.tangdou.com/202110/20000000550703_H720P.mp4?sign=1cba12488b792d9aa15f3ad7c797cb56&stTime=1634959388';
        await downloadFile(demoUrl, {
            force: true
        }).then((filePath) => {
            console.log('finish', filePath);
        }).catch(console.error);
    })
})