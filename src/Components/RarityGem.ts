import {Context} from "../platforms/CurrentPlatform";
import Component from "./Component";

export default class RarityGem extends Component {
	public assets(): string[] {
		return [this.parent.getRarityGemAsset()];
	}

	public render(context: Context, ratio: number): void {
		const asset = this.parent.getRarityGemAsset();
		if (!asset) {
			return;
		}
		const coords = this.parent.rarityGemCoords;
		coords.ratio = ratio;
		this.sunwell.drawImage(context, asset, coords);
	}
}
