import { ColorConfig, hexStringToColor, initializeColors } from '@0xsequence/discord-bot-server-utils';
import { botConfig } from './bot_config';

const colors: ColorConfig = initializeColors({
    // parse the hexadecimal values from the .env file
    Info: hexStringToColor(botConfig?.BLUE_COLOR),
    Success: hexStringToColor(botConfig?.GREEN_COLOR),
    Error: hexStringToColor(botConfig?.RED_COLOR),
    Warning: hexStringToColor(botConfig?.YELLOW_COLOR),
    // other colors...
});

export { colors };
