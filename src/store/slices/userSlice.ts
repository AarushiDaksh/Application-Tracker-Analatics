import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AppUser = { id: string; name: string; email: string } | null;

const initialState: { user: AppUser } = { user: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AppUser>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
