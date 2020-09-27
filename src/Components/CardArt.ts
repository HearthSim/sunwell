import {IPoint} from "../interfaces";
import Component from "./Component";
import {Context} from "../platforms/CurrentPlatform";

const ReferenceWidth = 670;
const ReferenceHeight = 1000;

/**
 * Helper function to draw a polygon from a list of points.
 */
export function drawPolygon(context: Context, points: IPoint[], ratio: number): void {
	if (points.length < 3) {
		return;
	}
	context.beginPath();
	// move to start point
	context.moveTo(points[0].x * ratio, points[0].y * ratio);
	// draw the lines starting at index 1
	points.slice(1).forEach((pt) => {
		context.lineTo(pt.x * ratio, pt.y * ratio);
	});
	context.closePath();
	context.stroke();
}

export default class CardArt extends Component {
	public render(context: Context, ratio: number): void {
		const coords = this.parent.artCoords;
		const texture = this.parent.getCardArtTexture();

		context.save();
		drawPolygon(context, this.parent.artClipPolygon, ratio);
		context.clip();
		context.fillStyle = "grey";
		context.fillRect(0, 0, ReferenceWidth * ratio, ReferenceHeight * ratio);
		context.drawImage(
			texture,
			0,
			0,
			texture.width,
			texture.height,
			coords.dx * ratio,
			coords.dy * ratio,
			coords.dWidth * ratio,
			coords.dHeight * ratio
		);
		context.restore();
	}
}
