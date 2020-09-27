interface IPlatform {
	name: string;
	buffers: any[];
	Image: any;
	Canvas: any;
	Promise: any;
	getBuffer(width: number, height: number, clear: boolean): void;
	freeBuffer(buffer): void;
	loadAsset(img, url, loaded, error): void;
	requestAnimationFrame(cb: () => void): void;
}

export default IPlatform;
