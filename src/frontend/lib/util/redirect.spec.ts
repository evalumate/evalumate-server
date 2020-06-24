import httpMocks from "node-mocks-http";
import { mocked } from "ts-jest/utils";

import { Router } from "./i18n";
import { redirectTo } from "./redirect";

jest.mock("./i18n");

describe("redirectTo()", () => {
  afterEach(() => {
    mocked(Router.push).mockClear();
  });

  describe("on the client side", () => {
    it("should redirect using the next router", () => {
      redirectTo("/destination");
      expect(Router.push).toHaveBeenLastCalledWith("/destination");
    });
  });

  describe("on the server side", () => {
    it("should reply with 302 and a location header", () => {
      const response = httpMocks.createResponse();

      redirectTo("/destination", response);

      expect(Router.push).not.toHaveBeenCalled();
      expect(response._getStatusCode()).toBe(302);
      expect(response._getHeaders().location).toBe("/destination");
    });
  });
});
