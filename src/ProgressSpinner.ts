import ora from "ora";
import {DownloadVideoInfo} from "./api";

export class ProgressSpinner {
    private spinner: ora.Ora;
    private timer!: NodeJS.Timer;
    private videoList: DownloadVideoInfo[] = [];

    constructor() {
        this.spinner = ora({
            text: '',
            prefixText: '下载进度'
        }).start();
    }

    public pushItem(video: DownloadVideoInfo) {
        this.videoList.push(video);
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.updateSpinner();
            }, 200);
        }
    }

    private updateSpinner() {
        const totalSize = this.videoList.length;
        const finishSize = this.videoList.filter(s => s._progressPercent && s._progressPercent >= 100).length;
        this.spinner.text = `[${finishSize}/${totalSize}]`;
    }

    public stop() {
        clearInterval(this.timer);
        this.spinner.stop();
    }
}