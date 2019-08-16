import { Router } from "express";
import Destructable from "../interfaces/Destructable";

abstract class Controller implements Destructable {
  public path: string;
  public router: Router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
  }

  async shutDown() {}
}

export default Controller;
