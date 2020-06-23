import nextRouter from "next/router";
import httpMocks from "node-mocks-http";
import { mocked } from "ts-jest/utils";

import { redirectTo } from "./redirect";

jest.mock("next/router");

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
