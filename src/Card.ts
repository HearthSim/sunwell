import CardDef from "./CardDef";
import AttackGem from "./Components/AttackGem";
import BodyText from "./Components/BodyText";
import CardArt from "./Components/CardArt";
import CardFrame from "./Components/CardFrame";
import CostGem from "./Components/CostGem";
import EliteDragon from "./Components/EliteDragon";
import HealthGem from "./Components/HealthGem";
import MultiClassBanner from "./Components/MultiClassBanner";
import NameBanner from "./Components/NameBanner";
import RaceBanner from "./Components/RaceBanner";
import RarityGem from "./Components/RarityGem";
import Watermark from "./Components/Watermark";
import {CardClass, CardSet, MultiClassGroup, Rarity} from "./Enums";
import {getCardFrameClass, getNumberStyle, getRaceText, getRarityGem} from "./helpers";
import {ICoords, IPoint} from "./interfaces";
import Sunwell from "./Sunwell";
import {Canvas, Context, Image} from "./platforms/CurrentPlatform";

const ReferenceWidth = 670;

export default abstract class Card {
	public cardDef: CardDef;
	public target;
	public texture;
	public canvas: Canvas;
	public raceText: string;
	public language: string;
	public costColor: string;
	public attackColor: string;
	public healthColor: string;
	public width: number;
	public key: number;
	public opposing: boolean;
	public attackGem: AttackGem;
	public bodyText: BodyText;
	public cardArt: CardArt;
	public cardFrame: CardFrame;
	public costGem: CostGem;
	public eliteDragon: EliteDragon;
	public healthGem: HealthGem;
	public multiClassBanner: MultiClassBanner;
	public raceBanner: RaceBanner;
	public nameBanner: NameBanner;
	public rarityGem: RarityGem;
	public watermark: Watermark;
	public eliteDragonAsset: string = "";
	public eliteDragonCoords: ICoords = null;
	public raceBannerAsset: string = "";
	public raceTextCoords: ICoords = {dx: 337, dy: 829};
	public raceBannerCoords: ICoords = {
		dx: 129,
		dy: 791,
		dWidth: 408,
		dHeight: 69,
		sWidth: 408,
		sHeight: 69,
	};

	public abstract baseCardFrameAsset: string;
	public abstract baseCardFrameCoords: ICoords;
	public abstract baseRarityGemAsset: string;
	public abstract bodyTextColor: string;
	public abstract bodyTextCoords: ICoords;
	public abstract nameBannerAsset: string;
	public abstract nameBannerCoords: ICoords;
	public abstract rarityGemCoords: ICoords;
	public abstract nameTextCurve: {
		pathMiddle: number;
		maxWidth: number;
		curve: IPoint[];
	};
	public abstract artClipPolygon: IPoint[];
	public abstract artCoords: ICoords;
	public abstract cardFoundationAsset: string;
	public abstract cardFoundationCoords: ICoords;
	public abstract premium: boolean;

	private callback: (Canvas) => void;
	private cacheKey: number;
	private propsJson: string;
	private sunwell: Sunwell;

	constructor(sunwell: Sunwell, props) {
		this.sunwell = sunwell;
		if (!props) {
			throw new Error("No card properties given");
		}

		this.cardDef = new CardDef(props);
		this.language = props.language || "enUS";

		// Sets the player or opponent HeroPower texture
		this.opposing = props.opposing || false;

		this.raceText = getRaceText(this.cardDef.race, this.cardDef.type, this.language);
		this.costColor = getNumberStyle(props.costStyle);
		this.attackColor = getNumberStyle(props.costStyle);
		this.healthColor = getNumberStyle(props.healthStyle);
		this.texture = props.texture;
		this.propsJson = JSON.stringify(props);

		this.attackGem = new AttackGem(sunwell, this);
		this.bodyText = new BodyText(sunwell, this);
		this.cardArt = new CardArt(sunwell, this);
		this.cardFrame = new CardFrame(sunwell, this);
		this.costGem = new CostGem(sunwell, this);
		this.eliteDragon = new EliteDragon(sunwell, this);
		this.healthGem = new HealthGem(sunwell, this);
		this.multiClassBanner = new MultiClassBanner(sunwell, this);
		this.nameBanner = new NameBanner(sunwell, this);
		this.raceBanner = new RaceBanner(sunwell, this);
		this.rarityGem = new RarityGem(sunwell, this);
		this.watermark = new Watermark(sunwell, this);
	}

	public abstract getWatermarkCoords(): ICoords;

	public getAttackGemAsset(): string {
		return "";
	}

	public getAttackGemCoords(): ICoords {
		return null;
	}

	public getAttackTextCoords(): ICoords {
		return null;
	}

	public getCostGemCoords(): ICoords {
		if (this.cardDef.costsHealth) {
			return {dx: 43, dy: 58};
		} else {
			return {dx: 47, dy: 105};
		}
	}

	public getCostTextCoords(): ICoords {
		return {dx: 115, dy: 174};
	}

	public getCostGemAsset(): string {
		if (this.cardDef.costsHealth) {
			return "cost-health";
		} else {
			return "cost-mana";
		}
	}

	public getHealthGemAsset(): string {
		return "";
	}

	public getHealthGemCoords(): ICoords {
		return null;
	}

	public getHealthTextCoords(): ICoords {
		return null;
	}

	public initRender(width: number, target, callback?: (canvas: Canvas) => void): void {
		this.width = width;
		this.target = target;
		this.callback = callback;
		this.cacheKey = this.checksum();
		this.key = this.cacheKey;
	}

	public getAssetsToLoad(): string[] {
		const assetsToCheck = [this.cardFoundationAsset];
		const assetsToLoad: string[] = [];
		for (const asset of assetsToCheck) {
			if (asset) {
				assetsToLoad.push(asset);
			}
		}

		assetsToLoad.push(...this.attackGem.assets());
		assetsToLoad.push(...this.nameBanner.assets());
		assetsToLoad.push(...this.cardFrame.assets());
		assetsToLoad.push(...this.costGem.assets());
		assetsToLoad.push(...this.eliteDragon.assets());
		assetsToLoad.push(...this.healthGem.assets());
		assetsToLoad.push(...this.multiClassBanner.assets());
		assetsToLoad.push(...this.raceBanner.assets());
		assetsToLoad.push(...this.rarityGem.assets());
		assetsToLoad.push(...this.watermark.assets());
		assetsToLoad.push(...this.eliteDragon.assets());

		if (this.cardDef.silenced) {
			assetsToLoad.push("silence-x");
		}

		return assetsToLoad;
	}

	public getCardArtTexture(): Image | Canvas {
		if (!this.texture) {
			this.sunwell.log("No card texture specified. Creating empty texture.");
			return this.sunwell.getBuffer(1024, 1024);
		} else if (this.texture instanceof this.sunwell.platform.Image) {
			return this.texture;
		} else if (typeof this.texture === "string") {
			return this.sunwell.assets[this.texture];
		} else {
			const t = this.sunwell.getBuffer(this.texture.crop.w, this.texture.crop.h);
			const tCtx = t.getContext("2d");
			tCtx.drawImage(
				this.texture.image,
				this.texture.crop.x,
				this.texture.crop.y,
				this.texture.crop.w,
				this.texture.crop.h,
				0,
				0,
				t.width,
				t.height
			);
			return t;
		}
	}

	public draw(canvas: Canvas, context: Context): void {
		const ratio = this.width / ReferenceWidth;

		const drawTimeout = setTimeout(() => {
			this.sunwell.error("Drawing timed out", this.cardDef.name);
		}, this.sunwell.options.drawTimeout);

		context.save();
		context.clearRect(0, 0, canvas.width, canvas.height);

		// >>>>> Begin Skeleton drawing
		if (this.sunwell.renderCache[this.cacheKey]) {
			this.sunwell.log("Skipping skeleton draw");
			context.drawImage(this.sunwell.renderCache[this.cacheKey], 0, 0);
		} else {
			if (this.cardFoundationAsset) {
				this.drawCardFoundationAsset(context, ratio);
			}

			this.cardArt.render(context, ratio);
			this.cardFrame.render(context, ratio);
			this.rarityGem.render(context, ratio);
			this.eliteDragon.render(context, ratio);
			this.nameBanner.render(context, ratio);
			this.raceBanner.render(context, ratio);
			this.attackGem.render(context, ratio);
			this.multiClassBanner.render(context, ratio);
			this.costGem.render(context, ratio);
			this.healthGem.render(context, ratio);
			this.watermark.render(context, ratio);

			if (this.sunwell.options.cacheSkeleton) {
				const cacheImage = new this.sunwell.platform.Image();
				cacheImage.src = canvas.toDataURL();
				this.sunwell.renderCache[this.cacheKey] = cacheImage;
			}
		}

		this.bodyText.render(context, ratio);

		if (this.cardDef.silenced) {
			this.sunwell.drawImage(context, "silence-x", {dx: 166, dy: 584, ratio: ratio});
		}

		context.restore();
		clearTimeout(drawTimeout);

		if (this.callback) {
			this.callback(canvas);
		}

		if (this.target) {
			this.target.src = canvas.toDataURL();
		}
	}

	public getBodyText(): string {
		return this.cardDef.collectionText || this.cardDef.text;
	}

	public drawCardFoundationAsset(context: Context, ratio: number): void {
		const coords = this.cardFoundationCoords;
		coords.ratio = ratio;
		this.sunwell.drawImage(context, this.cardFoundationAsset, coords);
	}

	public getCardFrameAsset(): string {
		const cardClass = getCardFrameClass(this.cardDef.cardClass);
		return this.baseCardFrameAsset + CardClass[cardClass].toLowerCase();
	}

	public getEliteDragonAsset(): string {
		if (this.cardDef.elite) {
			return this.eliteDragonAsset;
		} else {
			return "";
		}
	}

	public getMultiClassBannerAsset(): string {
		if (this.cardDef.multiClassGroup) {
			return "multi-" + MultiClassGroup[this.cardDef.multiClassGroup].toLowerCase();
		} else {
			return "";
		}
	}

	public getRarityGemAsset(): string {
		const rarity = getRarityGem(this.cardDef.rarity, this.cardDef.cardSet, this.cardDef.type);
		if (rarity) {
			return this.baseRarityGemAsset + Rarity[rarity].toLowerCase();
		}
		return "";
	}

	public getWatermarkAsset(): string {
		switch (this.cardDef.cardSet) {
			case CardSet.EXPERT1:
			case CardSet.NAXX:
			case CardSet.GVG:
			case CardSet.BRM:
			case CardSet.TGT:
			case CardSet.LOE:
			case CardSet.OG:
			case CardSet.KARA:
			case CardSet.GANGS:
			case CardSet.UNGORO:
			case CardSet.ICECROWN:
			case CardSet.HOF:
			case CardSet.LOOTAPALOOZA:
			case CardSet.GILNEAS:
			case CardSet.BOOMSDAY:
			case CardSet.TROLL:
			case CardSet.DALARAN:
				return "set-" + CardSet[this.cardDef.cardSet].toLowerCase();
			default:
				return "";
		}
	}

	private checksum(): number {
		const s = this.propsJson + this.width + this.premium;
		const length = s.length;
		let chk = 0;
		for (let i = 0; i < length; i++) {
			const char = s.charCodeAt(i);
			chk = (chk << 5) - chk + char;
			chk |= 0;
		}

		return chk;
	}
}
