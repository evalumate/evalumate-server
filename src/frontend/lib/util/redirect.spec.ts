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
import { isEmpty } from "lodash";

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
  const sessionId = faker.random.alphaNumeric(4);
  const session: Session = {
    id: sessionId,
    captchaRequired: false,
    name: faker.lorem.words(3),
    uri: `/sessions/${sessionId}`,
  };

  let store: Store;

  beforeEach(() => {
    // Setup a redux store
    store = createStore(rootReducer);
  });

  enum AdditionalEffects {
    setsVisitor,
    showsSnackbar,
  }

  const allPathnames = [
    "/",
    "/about",
    "/client",
    "/master",
    "/client/[sessionId]",
    "/master/[sessionId]",
  ];

  describe.each([
    // UserRole, sessionValid, expectedRedirect, paths, (additionalEffects)

    // Visitor
    [UserRole.Visitor, false, null, allPathnames.map(pathname => ({ pathname }))],

    // Member with invalid session
    [
      UserRole.Member,
      false,
      "/",
      [{ pathname: "/client/[sessionId]", query: { sessionId } }],
      [AdditionalEffects.setsVisitor, AdditionalEffects.showsSnackbar],
    ],
    [
      UserRole.Member,
      false,
      null,
      [
        { pathname: "/client" },
        { pathname: "/client/[sessionId]", query: { sessionId: "otherSession" } },
        { pathname: "/master" },
        { pathname: "/master/[sessionId]", query: { sessionId: "otherSession" } },
      ],
      [AdditionalEffects.setsVisitor],
    ],

    // Member with valid session
    [UserRole.Member, true, null, [{ pathname: "/client/[sessionId]", query: { sessionId } }]],
    [UserRole.Member, true, null, [{ pathname: "/about" }]],
    [UserRole.Member, true, `/client/${sessionId}`, [{ pathname: "/" }, { pathname: "/client" }]],
    [
      UserRole.Member,
      true,
      `/client/${sessionId}`,
      [
        { pathname: "/client/[sessionId]", query: { sessionId: "otherSession" } },
        { pathname: "/master" },
        { pathname: "/master/[sessionId]", query: { sessionId } },
        { pathname: "/master/[sessionId]", query: { sessionId: "otherSession" } },
      ],
      [AdditionalEffects.showsSnackbar],
    ],

    // Owner with invalid session
    [
      UserRole.Owner,
      false,
      "/",
      [{ pathname: "/master/[sessionId]", query: { sessionId } }],
      [AdditionalEffects.setsVisitor, AdditionalEffects.showsSnackbar],
    ],
    [
      UserRole.Owner,
      false,
      null,
      [
        { pathname: "/master" },
        { pathname: "/master/[sessionId]", query: { sessionId: "otherSession" } },
        { pathname: "/client" },
        { pathname: "/client/[sessionId]", query: { sessionId: "otherSession" } },
      ],
      [AdditionalEffects.setsVisitor],
    ],

    // Owner with valid session
    [UserRole.Owner, true, null, [{ pathname: "/master/[sessionId]", query: { sessionId } }]],
    [UserRole.Owner, true, null, [{ pathname: "/about" }]],
    [UserRole.Owner, true, `/master/${sessionId}`, [{ pathname: "/" }, { pathname: "/master" }]],
    [
      UserRole.Owner,
      true,
      `/master/${sessionId}`,
      [
        { pathname: "/master/[sessionId]", query: { sessionId: "otherSession" } },
        { pathname: "/client" },
        { pathname: "/client/[sessionId]", query: { sessionId } },
        { pathname: "/client/[sessionId]", query: { sessionId: "otherSession" } },
      ],
      [AdditionalEffects.showsSnackbar],
    ],
  ] as [UserRole, boolean, string | null, { pathname: string; query?: { sessionId: string } }[], AdditionalEffects[]?][])(
    "with UserRole = %p and sessionValid = %p",
    (role, sessionValid, expectedRedirect, paths, additionalEffects) => {
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
      for (const { pathname, query = {} } of paths) {
        // Generate description for `describe` block
        let description = `at '${pathname}'`;
        if (!isEmpty(query)) {
          description += " with query " + JSON.stringify(query);
        }

        describe(description, () => {
          if (expectedRedirect) {
            it(`should return '${expectedRedirect}'`, async () => {
              const url = await getRedirectUrlIfApplicable(store, pathname, query);
              expect(url).toBe(expectedRedirect);
            });
          } else {
            it("should return null", async () => {
              const url = await getRedirectUrlIfApplicable(store, pathname, query);
              expect(url).toBeNull();
            });
          }

          // Handle `additionalEffects`
          if (!additionalEffects || !additionalEffects.includes(AdditionalEffects.setsVisitor)) {
            it("should not change UserRole", async () => {
              await getRedirectUrlIfApplicable(store, pathname, query);
              expect(selectUserRole(store.getState())).toBe(role);
            });
          }
          if (!additionalEffects || !additionalEffects.includes(AdditionalEffects.showsSnackbar)) {
            it("should not show a snackbar", async () => {
              await getRedirectUrlIfApplicable(store, pathname, query);
              expect(selectSnackbarVisible(store.getState())).toBeFalse();
            });
          }

          if (additionalEffects) {
            for (const check of additionalEffects) {
              switch (check) {
                case AdditionalEffects.setsVisitor:
                  it("should set UserRole to Visitor", async () => {
                    await getRedirectUrlIfApplicable(store, pathname, query);
                    expect(selectUserRole(store.getState())).toBe(UserRole.Visitor);
                  });
                  break;

                case AdditionalEffects.showsSnackbar:
                  it("should show a snackbar", async () => {
                    await getRedirectUrlIfApplicable(store, pathname, query);
                    expect(selectSnackbarVisible(store.getState())).toBeTrue();
                  });
                  break;
              }
            }
          }
        });
      }
    }
  );
});
