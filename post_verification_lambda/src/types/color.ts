import { ColorConfig, hexStringToColor, initializeColors } from '@0xsequence/discord-utils';
import { botConfig } from './bot_config';

// Override default colors (or not)
const colors: ColorConfig = initializeColors({
    // parse the hexadecimal values from the .env file
    Info: hexStringToColor(botConfig?.BLUE_COLOR),
    Warning: hexStringToColor(botConfig?.YELLOW_COLOR),
    Error: hexStringToColor(botConfig?.RED_COLOR),
    Success: hexStringToColor(botConfig?.GREEN_COLOR),
    // other colors...
});

export { colors };
