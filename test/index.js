import axios from "axios";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

let should = chai.should();
chai.use(chaiAsPromised);

import server from "../lib/index.js";

axios.defaults.baseURL = "http://127.0.0.1:3000";

describe("Server", () => {
  it("GET / should return 200", async () => {
    return axios.get("/").should.eventually.have.property("status", 200);
  });
});

after(async () => {
  server.close();
});
