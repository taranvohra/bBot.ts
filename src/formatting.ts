import { User } from 'discord.js';
import { Pug } from '~models';
import { CONSTANTS, emojis } from '~utils';

export const formatPugFilledDM = (pug: Pug, guildName: string) => {
  const DMTitle = `**${pug.name.toUpperCase()}** filled in **${guildName}**`;
  const DMBody = pug.players.reduce((acc, curr, i) => {
    acc = acc + `${i === 0 ? '' : ' :small_blue_diamond: '}${curr.name}`;
    return acc;
  }, ``);
  return `${DMTitle}\n${DMBody}`;
};

export const formatJoinStatus = (statuses: Array<JoinStatus>) => {
  const { joined, missed, nf, aj, username } = statuses.reduce(
    (acc, { name, result, pug, user }) => {
      switch (result) {
        case 'not-found':
          acc.nf += `No pug found: **${name.toUpperCase()}**\n`;
          break;
        case 'full':
          acc.missed += `Sorry, **${name.toUpperCase()}** is already filled ${
            emojis.tearddy
          }\n`;
          break;
        case 'joined':
          acc.joined += `**${name.toUpperCase()}** (${pug?.players.length}/${
            pug?.noOfPlayers
          }) :small_orange_diamond: `;
          break;
        case 'present':
          acc.aj += `**${name.toUpperCase()}** `;
          break;
      }
      acc.username = user?.username ?? '';
      return acc;
    },
    { joined: ``, missed: ``, nf: ``, aj: ``, username: `` }
  );

  return `${
    joined.length > 0
      ? `${username} joined :small_orange_diamond: ${joined}`
      : ``
  } ${missed.length > 0 ? `\n${missed}` : ``} ${
    aj.length > 0 ? `\n${username} has already joined ${aj}` : ``
  } ${nf.length > 0 ? `\n${nf}` : ``}`;
};

export const formatLeaveStatus = (
  statuses: Array<LeaveStatus>,
  wentOffline?: boolean
) => {
  const { left, nf, nj, username } = statuses.reduce(
    (acc, { name, result, pug, user }) => {
      switch (result) {
        case 'left':
          acc.left += `${
            acc.left.length > 0 ? `, ` : ``
          }**${name.toUpperCase()}** (${pug?.players.length}/${
            pug?.noOfPlayers
          })`;
          break;
        case 'not-in':
          acc.nj = `Cannot leave pug(s) you haven't joined `;
          break;
        case 'not-found':
          acc.nf += `No pug found: **${name.toUpperCase()}**`;
          break;
      }
      acc.username = user?.username ?? '';
      return acc;
    },
    {
      left: ``,
      nj: ``,
      nf: ``,
      username: ``,
    }
  );

  return `${
    left.length > 0
      ? `${username} left ${left} ${
          wentOffline ? `because the user went offline` : ``
        }`
      : ``
  }${nj.length > 0 ? `\n${nj}` : ``}${nj.length > 0 ? `\n${nf}` : ``}`;
};

export const formatDeadPugs = (deadPugs: Array<{ pug: Pug; user: User }>) => {
  return deadPugs.reduce((acc, { pug, user }, i) => {
    acc += `${i > 0 ? `\n` : ``} ${
      emojis.peepoComfy
    } **${pug.name.toUpperCase()}** was stopped because **${
      user.username
    }** left ${emojis.peepoComfy}`;
    return acc;
  }, ``);
};

export const formatBroadcastPug = (pug: Pug) => {
  const title = `${
    emojis.peepoComfy
  } :mega: **${pug.name.toUpperCase()}** has been filled!`;

  const body = pug.players.reduce((acc, player) => {
    acc += `<@${player.id}> `;
    return acc;
  }, ``);

  const isDuel = pug.pickingOrder.length === 1 && pug.pickingOrder[0] === -1;
  const footer = isDuel
    ? ``
    : `Type **${
        CONSTANTS.defaultPrefix
      }captain** to become a captain for this pug. Random captains will be picked in ${
        CONSTANTS.autoCaptainPickTimer / 1000
      } seconds`;

  return `${title}\n${body}\n${footer}\n`;
};
