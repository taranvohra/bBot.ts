import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitPayload = WithGuildID & GuildBlockState;
type AddBlockedUserPayload = WithGuildID & Block;
type RemoveBlockedUserPayload = WithGuildID & { id: string };

type User = {
  id: string;
  username: string;
};

type Block = {
  culprit: User;
  by: User;
  blockedOn: Date;
  expiresAt: Date;
  reason: string;
};

type GuildBlockState = {
  list: Array<Block>;
};

type BlocksState = {
  [guild: string]: GuildBlockState;
};

let initialState: BlocksState = {};
const blocksSlice = createSlice({
  name: 'blocks',
  initialState,
  reducers: {
    initBlocks(state, action: PayloadAction<InitPayload>) {
      const { guildId, ...data } = action.payload;
      state[guildId] = data;
    },
    addBlockedUser(state, action: PayloadAction<AddBlockedUserPayload>) {
      const { guildId, ...block } = action.payload;
      state[guildId].list.push(block);
    },
    removeBlockedUser(state, action: PayloadAction<RemoveBlockedUserPayload>) {
      const { guildId, id } = action.payload;
      const blockedUserIndex = state[guildId].list.findIndex(
        (u) => u.culprit.id === id
      );
      state[guildId].list.splice(blockedUserIndex, 1);
    },
  },
});

export const {
  initBlocks,
  addBlockedUser,
  removeBlockedUser,
} = blocksSlice.actions;
export const blocksReducer = blocksSlice.reducer;
