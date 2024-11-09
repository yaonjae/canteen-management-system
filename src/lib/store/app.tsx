import { type StoreApi, type UseBoundStore, create } from "zustand";
import { shallow } from "zustand/shallow";
import { type UserSlice, createUserSlice } from "./user";

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;

  store.use = {};

  for (const k of Object.keys(store.getState())) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

const useStoreBase = create<UserSlice>()(
  //persist(
  (...a) => ({
    ...createUserSlice(...a),
  }),
);

export const useStore = createSelectors(useStoreBase);
