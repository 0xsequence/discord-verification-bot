import { ColorConfig, initializeColors } from '@0xsequence/discord-utils';
import { botConfig } from './bot_config';

// Override default colors (or not)
const colors: ColorConfig = initializeColors({
    // parse the hexadecimal values from the .env file
    Blue: botConfig?.BLUE_COLOR != null ? parseInt(botConfig.BLUE_COLOR.substring(2), 16) : undefined, // .substring(2) - remove 0x from env var
    Green: botConfig?.GREEN_COLOR != null ? parseInt(botConfig.GREEN_COLOR.substring(2), 16) : undefined,
    Red: botConfig?.RED_COLOR != null ? parseInt(botConfig.RED_COLOR.substring(2), 16) : undefined,
    Yellow: botConfig?.YELLOW_COLOR != null ? parseInt(botConfig.YELLOW_COLOR.substring(2), 16) : undefined,
    // other colors...
});

export { colors };
