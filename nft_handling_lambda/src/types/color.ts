import { ColorConfig, hexStringToColor, initializeColors } from '@0xsequence/discord-utils';
import { botConfig } from './bot_config';

const colors: ColorConfig = initializeColors({
    // parse the hexadecimal values from the .env file
    Blue: hexStringToColor(botConfig?.BLUE_COLOR),
    Green: hexStringToColor(botConfig?.GREEN_COLOR),
    Red: hexStringToColor(botConfig?.RED_COLOR),
    Yellow: hexStringToColor(botConfig?.YELLOW_COLOR),
    // other colors...
});

export { colors };
