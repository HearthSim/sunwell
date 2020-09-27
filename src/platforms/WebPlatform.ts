import IPlatform from "./IPlatform";

export type Canvas = HTMLCanvasElement;
export type Context = CanvasRenderingContext2D;
export type Image = HTMLImageElement;

export default class WebPlatform implements IPlatform {
	public name = "WEB";
	public Image = Image;
	public Canvas = HTMLCanvasElement;
	public Promise = Promise;
	public buffers = [];

	public getBuffer(width?: number, height?: number, clear?: boolean): HTMLCanvasElement {
		let cvs: HTMLCanvasElement;
		if (this.buffers.length) {
			if (width) {
				for (let i = 0; i < this.buffers.length; i++) {
					if (this.buffers[i].width === width && this.buffers[i].height === height) {
						cvs = this.buffers.splice(i, 1)[0];
						break;
					}
				}
			} else {
				cvs = this.buffers.pop();
			}
			if (cvs) {
				if (clear) {
					cvs.getContext("2d").clearRect(0, 0, cvs.width, cvs.height);
				}
				return cvs;
			}
		}

		cvs = document.createElement("canvas");

		if (width) {
			cvs.width = width;
			cvs.height = height;
		}

		return cvs;
	}

	public freeBuffer(buffer: any): void {
		this.buffers.push(buffer);
	}

	public loadAsset(img: any, url: any, loaded: any, error: any): void {
		img.crossOrigin = "Anonymous";
		img.addEventListener("load", loaded);
		img.addEventListener("error", error);
		img.src = url;
	}

	public requestAnimationFrame(cb) {
		window.requestAnimationFrame(cb);
	}
}
