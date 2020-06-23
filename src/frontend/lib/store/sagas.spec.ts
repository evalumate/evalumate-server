import { createMockTask } from "@redux-saga/testing-utils";
import getConfig from "next/config";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware, { Task } from "redux-saga";
import { testSaga } from "redux-saga-test-plan";
import { Store } from "StoreTypes";
import { mocked } from "ts-jest/utils";
import { getType } from "typesafe-actions";

import { Member } from "../models/Member";
import { UserRole } from "../models/UserRole";
import { setUserRole } from "./actions/global";
import { setMember, setUnderstanding } from "./actions/member";
import rootReducer from "./reducers";
import { fetchRecordsSaga, memberSaga, ownerSaga, pingSaga } from "./sagas";
import { selectUserRole } from "./selectors/global";
import { setUnderstanding as apiSetUnderstanding } from "./thunks/member";

const { publicRuntimeConfig } = getConfig();
const { recordInterval, memberPingInterval } = publicRuntimeConfig;

const memberPingIntervalMs = memberPingInterval * 1000;
const recordIntervalMs = recordInterval * 1000;

jest.useFakeTimers();

// Mock api thunks
jest.mock("./thunks/member");

// Mock environment flags
jest.mock("../util/environment");
const setClient: () => void = require("../util/environment").__setClient;
const setServer: () => void = require("../util/environment").__setServer;

// Reset environment to server after each test
afterEach(setServer);

describe("ownerSaga", () => {
  describe("on the server side", () => {
    it("should call fetchRecordsSaga and finish", () => {
      testSaga(ownerSaga).next().call(fetchRecordsSaga).next().isDone();
    });
  });

  describe("on the client side", () => {
    beforeEach(setClient);

    it("should repeatedly call fetchRecordsSaga", () => {
      testSaga(ownerSaga)
        .next()
        .call(fetchRecordsSaga)
        .next()
        .delay(recordIntervalMs)
        .next(true)
        .call(fetchRecordsSaga)
        .next()
        .delay(recordIntervalMs)
        .next(true)
        .call(fetchRecordsSaga);
    });
  });
});

describe("memberSaga", () => {
  const mockedApiSetUnderstanding = mocked(apiSetUnderstanding);

  const member: Member = {
    id: "memberId",
    uri: "memberUri",
    secret: "memberSecret",
  };

  it("should update and ping the api", async () => {
    let store: Store;
    let task: Task;

    const sagaMiddleware = createSagaMiddleware();
    store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
    store.dispatch(setMember(member));
    store.dispatch(setUnderstanding(true));
    task = sagaMiddleware.run(memberSaga);

    // Use a mock action as the return value of the `apiSetUnderstanding` thunk cation creator
    mockedApiSetUnderstanding.mockReturnValue({ type: "", payload: "" } as any);

    // redux-saga-test-plan is great, but the race was too tricky to test with it here
    const wait = async (duration = memberPingIntervalMs) => {
      jest.advanceTimersByTime(duration);
      await Promise.resolve();
    };

    // Wait for an api call
    await wait();
    expect(mockedApiSetUnderstanding).toHaveBeenCalledTimes(1);
    expect(mockedApiSetUnderstanding).toHaveBeenLastCalledWith(member, true);

    // Wait 1/2 ping interval and modify `understanding`
    await wait(memberPingIntervalMs / 2);
    store.dispatch(setUnderstanding(false));
    expect(mockedApiSetUnderstanding).toHaveBeenCalledTimes(2);
    expect(mockedApiSetUnderstanding).toHaveBeenLastCalledWith(member, false);

    // Wait another half ping interval – no api call should be made
    await wait(memberPingIntervalMs / 2);
    expect(mockedApiSetUnderstanding).toHaveBeenCalledTimes(2);

    // However, a full ping interval after the modification, a new call should be made...
    await wait(memberPingIntervalMs / 2);
    expect(mockedApiSetUnderstanding).toHaveBeenCalledTimes(3);
    expect(mockedApiSetUnderstanding).toHaveBeenLastCalledWith(member, false);

    // ...and of course another ping interval later
    await wait();
    expect(mockedApiSetUnderstanding).toHaveBeenCalledTimes(4);
    expect(mockedApiSetUnderstanding).toHaveBeenLastCalledWith(member, false);

    task.cancel();
  });
});

describe("pingSaga", () => {
  describe("on the client side", () => {
    beforeEach(setClient);

    it("should fork correctly and restart on setUserRole actions", () => {
      const memberTask = createMockTask();
      const ownerTask = createMockTask();

      testSaga(pingSaga)
        .next()

        // Test with member role
        .select(selectUserRole)
        .next(UserRole.Member)

        .fork(memberSaga) // Should fork member saga
        .next(memberTask)

        // Test with owner role
        .take(getType(setUserRole))
        .next(UserRole.Owner)

        .cancel(memberTask) // Should cancel the previous task
        .next()

        .fork(ownerSaga) // Should fork owner saga
        .next(ownerTask)

        // Test with visitor role
        .take(getType(setUserRole))
        .next(UserRole.Visitor)

        .cancel(ownerTask) // Should cancel the previous task...
        .next()

        // ...and take no action, instead wait for user role to be set again

        // Switch to member role again
        .take(getType(setUserRole))
        .next(UserRole.Member)

        .fork(memberSaga); // Should fork member saga again
      // And so on...
    });
  });

  describe("on the server side", () => {
    it("should fork without restart and only if UserRole = owner", () => {
      testSaga(pingSaga)
        // Test with member role
        .next()
        .select(selectUserRole)
        .next(UserRole.Member)
        .isDone()

        // Test with visitor
        .restart()
        .next()
        .select(selectUserRole)
        .next(UserRole.Visitor)
        .isDone()

        // Test with owner
        .restart()
        .next()
        .select(selectUserRole)
        .next(UserRole.Owner)
        .fork(ownerSaga) // Should fork owner saga...
        .next(createMockTask())
        .isDone(); // ...and finish
    });
  });
});
