import axios from "axios";
import Captcha from "../lib/entities/captcha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

const should = chai.should();
chai.use(chaiAsPromised);

describe("Unit tests", () => {
  describe("Frontend", () => {
    describe("/", () => {
      it("GET should return 200", async () => {
        return axios.get("/").should.eventually.have.property("status", 200);
      });
    });
  });
});
