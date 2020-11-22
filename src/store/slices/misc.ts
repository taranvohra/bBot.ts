import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitPayload = WithGuildID & GuildMiscState;
type SetPrefixPayload = WithGuildID & Pick<GuildMiscState, 'prefix'>;
type IgnoreCommandGroupPayload = WithGuildID & { command: string };
type UnIgnoreCommandGroupPayload = IgnoreCommandGroupPayload;
type AddCommandCooldown = WithGuildID & { command: string; timestamp: Date };

type GuildMiscState = {
  prefix: string | null;
  ignoredCommandGroup: Set<string>;
  cooldowns: {
    [command: string]: Date;
  };
};

type MiscState = {
  [guild: string]: GuildMiscState;
};

let initialState: MiscState = {};
const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    initMisc(state, action: PayloadAction<InitPayload>) {
      const { guildId, ...data } = action.payload;
      state[guildId] = data;
    },
    setPrefix(state, action: PayloadAction<SetPrefixPayload>) {
      const { guildId, prefix } = action.payload;
      state[guildId].prefix = prefix;
    },
    ignoreCommandGroup(
      state,
      action: PayloadAction<IgnoreCommandGroupPayload>
    ) {
      const { guildId, command } = action.payload;
      state[guildId].ignoredCommandGroup.add(command);
    },
    unIgnoreCommandGroup(
      state,
      action: PayloadAction<UnIgnoreCommandGroupPayload>
    ) {
      const { guildId, command } = action.payload;
      state[guildId].ignoredCommandGroup.delete(command);
    },
    addCommandCooldown(state, action: PayloadAction<AddCommandCooldown>) {
      const { guildId, command, timestamp } = action.payload;
      state[guildId].cooldowns[command] = timestamp;
    },
  },
});

export const {
  initMisc,
  ignoreCommandGroup,
  setPrefix,
  unIgnoreCommandGroup,
} = miscSlice.actions;
export const miscReducer = miscSlice.reducer;