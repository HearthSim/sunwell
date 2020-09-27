import {CardType} from "../Enums";
import {Context} from "../platforms/CurrentPlatform";
import Component from "./Component";

export default class Watermark extends Component {
	public assets(): string[] {
		return [this.parent.getWatermarkAsset()];
	}

	public render(context: Context, ratio: number): void {
		const asset = this.parent.getWatermarkAsset();
		if (!asset) {
			return;
		}

		if (
			this.parent.premium ||
			this.parent.cardDef.type === CardType.MINION ||
			this.parent.cardDef.type === CardType.HERO
		) {
			context.globalCompositeOperation = "multiply";
			context.globalAlpha = 0.6;
		} else if (this.parent.cardDef.type === CardType.SPELL) {
			context.globalCompositeOperation = "multiply";
			context.globalAlpha = 0.7;
		} else if (this.parent.cardDef.type === CardType.WEAPON) {
			context.globalCompositeOperation = "lighten";
			context.globalAlpha = 0.1;
		}

		const coords = this.parent.getWatermarkCoords();
		coords.ratio = ratio;
		this.sunwell.drawImage(context, asset, coords);

		// Reset context
		context.globalCompositeOperation = "source-over";
		context.globalAlpha = 1;
	}
}
