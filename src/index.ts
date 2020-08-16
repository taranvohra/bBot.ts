import { Client, Intents } from 'discord.js';
import log from './log';
import { onMessage } from '~features';

/*
 *  bBot will only receive the following events
 *  https://discord.com/developers/docs/topics/gateway#list-of-intents
 */
const intents = new Intents();
intents.add('GUILDS', 'GUILD_MEMBERS', 'GUILD_PRESENCES', 'GUILD_MESSAGES');
const bBot = new Client({ ws: { intents } });

(async () => {
  try {
    await bBot.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();

/*
 * B O T
 *   E V E N T S
 */
bBot.on('ready', () => {
  // TODO discord channel log
  log.info(`Bot started running at ${new Date().toUTCString()}`);
});

bBot.on('disconnect', () => {});

bBot.on('message', (message) => onMessage(message, bBot));