import getConfig from "next/config";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware, { Task } from "redux-saga";
import { Store } from "StoreTypes";
import { mocked } from "ts-jest/utils";

import { Member } from "../models/Member";
import { Session } from "../models/Session";
import { resetSession, setIsUnderstanding, setMemberSession } from "./actions/session";
import rootReducer from "./reducers";
import { memberSaga } from "./sagas";
import { setIsUnderstanding as apiSetIsUnderstanding } from "./thunks/member";

const { publicRuntimeConfig } = getConfig();
const { memberPingInterval: memberPingIntervalSeconds } = publicRuntimeConfig;

const memberPingInterval = memberPingIntervalSeconds * 1000;

jest.useFakeTimers();

// Mock api thunks
jest.mock("./thunks/member");

describe("memberSaga", () => {
  const mockedApiSetIsUnderstanding = mocked(apiSetIsUnderstanding);

  const member: Member = {
    id: "memberId",
    uri: "memberUri",
    secret: "memberSecret",
  };

  const session: Session = {
    id: "sessionId",
    captchaRequired: false,
    name: "sessionName",
    uri: "sessionUri",
  };

  it("should update and ping the api", async () => {
    let store: Store;
    let task: Task;

    // Use a mock action as the return value of the `apiSetUnderstanding` thunk cation creator
    mockedApiSetIsUnderstanding.mockReturnValue({ type: "", payload: "" } as any);

    // redux-saga-test-plan is great, but the race was too tricky to test with it here
    const wait = (duration = memberPingInterval) => {
      jest.advanceTimersByTime(duration);
      return Promise.resolve();
    };

    const expectLastCallToBeWith = (isUnderstanding: boolean) => {
      expect(mockedApiSetIsUnderstanding).toHaveBeenLastCalledWith(
        member,
        isUnderstanding,
        expect.anything()
      );
    };

    const sagaMiddleware = createSagaMiddleware();
    store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
    store.dispatch(setMemberSession({ session, member }));
    task = sagaMiddleware.run(memberSaga);

    expect(mockedApiSetIsUnderstanding).toHaveBeenCalledTimes(0);

    // Wait for an api call
    await wait();
    expect(mockedApiSetIsUnderstanding).toHaveBeenCalledTimes(1);
    expectLastCallToBeWith(true);

    // Wait 1/2 ping interval and modify `understanding`
    await wait(memberPingInterval / 2);
    store.dispatch(setIsUnderstanding(false));
    expect(mockedApiSetIsUnderstanding).toHaveBeenCalledTimes(2);
    expectLastCallToBeWith(false);

    // Wait another half ping interval – no api call should be made
    await wait(memberPingInterval / 2);
    expect(mockedApiSetIsUnderstanding).toHaveBeenCalledTimes(2);

    // However, a full ping interval after the modification, a new call should be made...
    await wait(memberPingInterval / 2);
    expect(mockedApiSetIsUnderstanding).toHaveBeenCalledTimes(3);
    expectLastCallToBeWith(false);

    // ...and of course another ping interval later
    await wait();
    expect(mockedApiSetIsUnderstanding).toHaveBeenCalledTimes(4);
    expectLastCallToBeWith(false);

    store.dispatch(resetSession());
    member.id = "secondMemberId";
    store.dispatch(setMemberSession({ session, member }));

    await wait(memberPingInterval);
    expect(task.isRunning()).toBe(false);
  });
});
