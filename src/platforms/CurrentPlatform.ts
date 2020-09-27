/*#if _PLATFORM == "node"
export {default} from "./NodePlatform";
export * from "./NodePlatform";
//#else */
export {default} from "./WebPlatform";
export * from "./WebPlatform";
//#endif
