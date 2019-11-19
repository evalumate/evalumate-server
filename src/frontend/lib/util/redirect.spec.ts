import { getRedirectUrlIfApplicable, redirectTo } from "./redirect";
import { getSession } from "../api/session";
import { Session } from "../models/Session";
import { UserRole } from "../models/UserRole";
import { setSession, setUserRole } from "../store/actions/global";
import rootReducer from "../store/reducers";
import { selectSnackbarVisible, selectUserRole } from "../store/selectors/global";
import faker from "faker";
import nextRouter from "next/router";
import httpMocks from "node-mocks-http";
import { createStore } from "redux";
import { Store } from "StoreTypes";
import { mocked } from "ts-jest/utils";

jest.mock("next/router");
jest.mock("../api/session");

const mockedGetSession = mocked(getSession);

describe("redirectTo()", () => {
  afterEach(() => {
    mocked(nextRouter.push).mockClear();
  });

  describe("on the client side", () => {
    it("should redirect using the next router", () => {
      redirectTo("/destination");
      expect(nextRouter.push).toHaveBeenLastCalledWith("/destination");
    });
  });

  describe("on the server side", () => {
    it("should reply with 302 and a location header", () => {
      const response = httpMocks.createResponse();

      redirectTo("/destination", response);

      expect(nextRouter.push).not.toHaveBeenCalled();
      expect(response._getStatusCode()).toBe(302);
      expect(response._getHeaders().location).toBe("/destination");
    });
  });
});

describe("getRedirectUrlIfApplicable()", () => {
  const session: Session = {
    id: "sessionId",
    captchaRequired: false,
    name: faker.lorem.words(3),
    uri: "/sessions/sessionId",
  };

  let store: Store;

  beforeEach(() => {
    // Setup a redux store
    store = createStore(rootReducer);
  });

  enum AdditionalTests {
    setsVisitor,
    showsSnackbar,
  }

  const allPages = ["/", "/about", "/client", "/master", "/client/sessionId", "/master/sessionId"];

  describe.each([
    // UserRole, sessionValid, expectedRedirect, paths, (additionalTests)
    // Visitor
    [UserRole.Visitor, false, null, allPages],

    // Member with invalid session
    [
      UserRole.Member,
      false,
      "/",
      ["/client/sessionId"],
      [AdditionalTests.setsVisitor, AdditionalTests.showsSnackbar],
    ],
    [
      UserRole.Member,
      false,
      null,
      ["/client", "/client/anotherSessionId"],
      [AdditionalTests.setsVisitor],
    ],

    // Member with valid session
    [UserRole.Member, true, null, ["/client/sessionId"]],
    [UserRole.Member, true, null, ["/about"]],
    [UserRole.Member, true, "/client/sessionId", ["/", "/client"]],
    [
      UserRole.Member,
      true,
      "/client/sessionId",
      ["/client/anotherSessionId"],
      [AdditionalTests.showsSnackbar],
    ],

    // Owner with invalid session
    [
      UserRole.Owner,
      false,
      "/",
      ["/master/sessionId"],
      [AdditionalTests.setsVisitor, AdditionalTests.showsSnackbar],
    ],
    [
      UserRole.Owner,
      false,
      null,
      ["/master", "/master/anotherSessionId"],
      [AdditionalTests.setsVisitor],
    ],

    // Owner with valid session
    [UserRole.Owner, true, null, ["/master/sessionId"]],
    [UserRole.Owner, true, null, ["/about"]],
    [UserRole.Owner, true, "/master/sessionId", ["/", "/master"]],
    [
      UserRole.Owner,
      true,
      "/master/sessionId",
      ["/master/anotherSessionId"],
      [AdditionalTests.showsSnackbar],
    ],
  ] as [UserRole, boolean, string | null, string[], AdditionalTests[]?][])(
    "with UserRole = %p and sessionValid = %p",
    (role, sessionValid, expectedRedirect, paths, additionalTests) => {
      beforeEach(() => {
        store.dispatch(setUserRole(role));
        store.dispatch(setSession(session));

        if (sessionValid) {
          mockedGetSession.mockResolvedValue(session);
        } else {
          mockedGetSession.mockResolvedValue(null);
        }
      });

      afterEach(() => {
        mockedGetSession.mockReset();
      });

      // Test with each path in `paths`
      describe.each(paths)("at '%s'", path => {
        if (expectedRedirect) {
          it(`should return '${expectedRedirect}'`, async () => {
            const url = await getRedirectUrlIfApplicable(store, path);
            expect(url).toBe(expectedRedirect);
          });
        } else {
          it("should return null", async () => {
            const url = await getRedirectUrlIfApplicable(store, path);
            expect(url).toBeNull();
          });
        }

        // Optionally add tests for `additionalTests`
        if (additionalTests) {
          for (const check of additionalTests) {
            switch (check) {
              case AdditionalTests.setsVisitor:
                it("should set UserRole to Visitor", async () => {
                  await getRedirectUrlIfApplicable(store, path);
                  expect(selectUserRole(store.getState())).toBe(UserRole.Visitor);
                });
                break;

              case AdditionalTests.showsSnackbar:
                it("should show a snackbar", async () => {
                  await getRedirectUrlIfApplicable(store, path);
                  expect(selectSnackbarVisible(store.getState())).toBeTrue();
                });
                break;
            }
          }
        }
      });
    }
  );
});
