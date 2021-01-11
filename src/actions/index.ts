import { Guilds, GameType, GuildStats, Pug, Users, Pugs } from '~models';

export const updateGuildPugChannel = (guildId: string, channelId: string) =>
  Guilds.findByIdAndUpdate(guildId, {
    $set: {
      pugChannel: channelId,
    },
  }).exec();

export const updateGuildQueryChannel = (guildId: string, channelId: string) =>
  Guilds.findByIdAndUpdate(guildId, {
    $set: {
      queryChannel: channelId,
    },
  }).exec();

export const updateGuildPrefix = (guildId: string, prefix: string) =>
  Guilds.findByIdAndUpdate(guildId, {
    $set: {
      prefix,
    },
  }).exec();

export const addGuildIgnoredCommandGroup = (guildId: string, group: string) =>
  Guilds.findByIdAndUpdate(guildId, {
    $addToSet: {
      ignoredCommandGroup: group,
    },
  }).exec();

export const removeGuildIgnoredCommandGroup = (
  guildId: string,
  group: string
) =>
  Guilds.findByIdAndUpdate(guildId, {
    $pull: {
      ignoredCommandGroup: group,
    },
  }).exec();

export const addGuildGameType = (guildId: string, gameType: GameType) =>
  Guilds.findByIdAndUpdate(guildId, {
    $push: {
      gameTypes: gameType,
    },
  }).exec();

export const deleteGuildGameType = (guildId: string, gameTypeName: string) =>
  Guilds.findByIdAndUpdate(guildId, {
    $pull: { gameTypes: { name: gameTypeName } },
  }).exec();

export const getNextSequences = async (
  guildId: string,
  gameTypeName: string
) => {
  const updated = await GuildStats.findByIdAndUpdate(
    guildId,
    {
      $inc: {
        total: 1,
        [`pugs.${gameTypeName}`]: 1,
      },
    },
    { new: true }
  ).exec();

  if (updated) {
    return { total: updated.total, current: updated.pugs[gameTypeName] };
  }
};

export const updateStatsAfterPug = (
  { players, captains, name }: Pug,
  savedPugId: string,
  guildId: string
) => {
  const computeNewRating = (
    existingRating: number,
    existingTotalPugs: number,
    existingTotalCaptain: number,
    pick: number
  ) => {
    if (existingTotalPugs === 0) return pick;
    return (
      (existingRating * (existingTotalPugs - existingTotalCaptain) + pick) /
      (existingTotalPugs - existingTotalCaptain + 1)
    );
  };

  Users.bulkWrite(
    players.map((player) => {
      const { id: userId, name: username, pick, stats } = player;
      const { rating, totalCaptain, totalPugs } = stats[name];
      const wasCaptain = captains.includes(userId);

      const updatedTotalCaptain = totalCaptain + Number(wasCaptain);
      const updatedTotalPugs = totalPugs + 1;
      const updatedRating = wasCaptain
        ? rating
        : computeNewRating(rating, totalPugs, totalCaptain, Number(pick));

      return {
        updateOne: {
          filter: {
            guildId,
            userId,
          },
          update: {
            $set: {
              username,
              lastPug: savedPugId,
              [`stats.${name}.rating`]: updatedRating,
              [`stats.${name}.totalCaptain`]: updatedTotalCaptain,
              [`stats.${name}.totalPugs`]: updatedTotalPugs,
            },
          },
          upsert: true,
        },
      };
    }),
    { ordered: false }
  );
};

export const getLastXPug = async (
  guildId: string,
  howFar: number,
  gameType?: string
) => {
  const guildStats = await GuildStats.findById(guildId).exec();
  if (gameType) {
    const totalGamesForGameType = guildStats?.pugs[gameType] ?? 0;
    const gameSequence = totalGamesForGameType - (howFar - 1);
    return Pugs.findOne({
      guildId,
      gameSequence,
      name: gameType,
    });
  } else {
    const totalGamesSoFar = guildStats?.total ?? 0;
    const overallSequence = totalGamesSoFar - (howFar - 1);
    return Pugs.findOne({
      guildId,
      overallSequence,
    });
  }
};
