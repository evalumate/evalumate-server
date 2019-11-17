import { setSession, setUserRole } from "./actions/global";
import { setMember, setUnderstanding } from "./actions/member";
import { setRecords } from "./actions/owner";
import rootReducer from "./reducers";
import { fetchRecordsSaga, memberSaga, ownerSaga, pingSaga } from "./sagas";
import { selectUserRole } from "./selectors/global";
import { setUnderstanding as apiSetUnderstanding } from "../api/member";
import { getRecords } from "../api/record";
import { Member } from "../models/Member";
import { Session } from "../models/Session";
import { UserRole } from "../models/UserRole";
import { createMockTask } from "@redux-saga/testing-utils";
import faker from "faker";
import getConfig from "next/config";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware, { Task } from "redux-saga";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { Store } from "StoreTypes";
import { mocked } from "ts-jest/utils";
import { getType } from "typesafe-actions";

const { publicRuntimeConfig } = getConfig();
const { recordInterval, memberPingInterval } = publicRuntimeConfig;

const memberPingIntervalMs = memberPingInterval * 1000;
const recordIntervalMs = recordInterval * 1000;

jest.useFakeTimers();

// Mock api
jest.mock("../api/member");
jest.mock("../api/record");

// Mock environment flags
jest.mock("../util/environment");
const setClient: () => void = require("../util/environment").__setClient;
const setServer: () => void = require("../util/environment").__setServer;

// Reset environment to server after each test
afterEach(setServer);

describe("fetchRecordsSaga", () => {
  const mockedGetRecords = mocked(getRecords);

  const session: Session = {
    id: "sessionId",
    uri: "sessionUri",
    name: "sessionName",
    captchaRequired: false,
  };

  const records = [0, 1, 2].map(id => ({
    id,
    time: faker.random.number(),
    registeredMembersCount: faker.random.number(),
    activeMembersCount: faker.random.number(),
    understandingMembersCount: faker.random.number(),
  }));

  describe("with no records in the store", () => {
    it("should fetch all records", async () => {
      mockedGetRecords.mockResolvedValue(records);

      const store = createStore(rootReducer);
      store.dispatch(setSession(session));
      const initialState = store.getState();

      const { storeState } = await expectSaga(fetchRecordsSaga)
        .withReducer(rootReducer, initialState)
        .run();

      expect(mockedGetRecords).toHaveBeenLastCalledWith(session);
      expect(storeState.owner.records).toEqual(records);
    });
  });

  describe("with a record in the store", () => {
    it("should fetch all records after that record", async () => {
      mockedGetRecords.mockResolvedValue(records.slice(1));

      const store = createStore(rootReducer);
      store.dispatch(setSession(session));
      store.dispatch(setRecords(records.slice(0, 1)));
      const initialState = store.getState();

      const { storeState } = await expectSaga(fetchRecordsSaga)
        .withReducer(rootReducer, initialState)
        .run();

      expect(mockedGetRecords).toHaveBeenLastCalledWith(session, records[0].id);
      expect(storeState.owner.records).toEqual(records);
    });
  });
});

describe("ownerSaga", () => {
  describe("on the server side", () => {
    it("should call fetchRecordsSaga and finish", () => {
      testSaga(ownerSaga)
        .next()
        .call(fetchRecordsSaga)
        .next()
        .isDone();
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

  const member: Member = { id: "memberId", uri: "memberUri", secret: "memberSecret" };

  let store: Store;
  let task: Task;

  beforeAll(() => {
    const sagaMiddleware = createSagaMiddleware();
    store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
    store.dispatch(setMember(member));
    store.dispatch(setUnderstanding(true));
    task = sagaMiddleware.run(memberSaga);
  });

  it("should update and ping the api", async () => {
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
    await wait(memberPingIntervalMs);
    expect(apiSetUnderstanding).toHaveBeenCalledTimes(4);
    expect(apiSetUnderstanding).toHaveBeenLastCalledWith(member, false);

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
