import Card from "../Card";
import {contextBoundingBox} from "../helpers";
import {ICoords} from "../interfaces";
import {Context} from "../platforms/CurrentPlatform";
import Sunwell from "../Sunwell";
import Component from "./Component";

export default class Gem extends Component {
	public gemAsset: string;
	public gemCoords: ICoords;
	public showGem: boolean;
	public showText: boolean;
	public text: string;
	public textColor: string;
	public textCoords: ICoords;
	public textSize: number;

	constructor(sunwell: Sunwell, parent: Card) {
		super(sunwell, parent);
		this.textSize = 124;
	}

	public assets(): string[] {
		return [this.gemAsset];
	}

	public render(context: Context, ratio: number): void {
		const asset = this.gemAsset;
		if (asset && this.showGem) {
			const coords = this.gemCoords;
			coords.ratio = ratio;
			this.sunwell.drawImage(context, asset, coords);
		}

		if (!this.showText || !this.textCoords) {
			return;
		}
		const textCoords = this.textCoords;
		textCoords.ratio = ratio;

		const buffer = this.sunwell.getBuffer(256, 256, true);
		const bufferCtx = buffer.getContext("2d");
		let tX = 10;

		bufferCtx.font = `${this.textSize}px "${this.sunwell.options.gemFont}"`;
		bufferCtx.lineCap = "round";
		bufferCtx.lineJoin = "round";
		bufferCtx.textAlign = "left";
		bufferCtx.textBaseline = "hanging";

		for (const char of this.text) {
			bufferCtx.lineWidth = 10;
			bufferCtx.strokeStyle = "black";
			bufferCtx.fillStyle = "black";
			bufferCtx.fillText(char, tX, 10);
			bufferCtx.strokeText(char, tX, 10);

			bufferCtx.fillStyle = this.textColor;
			bufferCtx.strokeStyle = this.textColor;
			bufferCtx.lineWidth = 2.5;
			bufferCtx.fillText(char, tX, 10);
			// context.strokeText(char, x, y);

			tX += bufferCtx.measureText(char).width;
		}

		const b = contextBoundingBox(bufferCtx);

		context.drawImage(
			buffer,
			b.x,
			b.y,
			b.w,
			b.h,
			(textCoords.dx - b.w / 2) * textCoords.ratio,
			(textCoords.dy - b.h / 2) * textCoords.ratio,
			b.w * textCoords.ratio,
			b.h * textCoords.ratio
		);

		this.sunwell.freeBuffer(buffer);
	}
}
