import {Context} from "../platforms/CurrentPlatform";
import Component from "./Component";

export default class EliteDragon extends Component {
	public assets(): string[] {
		return [this.parent.getEliteDragonAsset()];
	}

	public render(context: Context, ratio: number): void {
		const asset = this.parent.getEliteDragonAsset();
		if (!asset) {
			return;
		}

		const coords = this.parent.eliteDragonCoords;
		coords.ratio = ratio;
		this.sunwell.drawImage(context, asset, coords);
	}
}
