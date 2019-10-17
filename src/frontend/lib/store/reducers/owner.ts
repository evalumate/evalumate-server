import { createReducer } from "typesafe-actions";

export type OwnerState = Readonly<{}>;

const initialState: OwnerState = {};

const ownerReducer = createReducer(initialState);

export default ownerReducer;
