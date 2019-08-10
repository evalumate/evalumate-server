import { Request, Response, Router } from "express";
import * as respond from "../utils/api-respond";
import Controller from "../interfaces/controller";
import Captcha from "../entities/captcha";
import svgCaptcha from "svg-captcha";
import randomstring from "randomstring";
import { createLogger } from "../utils/logger";
import { NextFunction } from "connect";

const logger = createLogger(module);

class CaptchaController implements Controller {
  public path = "/captcha";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getNewCaptcha);
  }

  getNewCaptcha = async (req: Request, res: Response) => {
    logger.debug("Generating new captcha");
    const generatedCaptcha = svgCaptcha.create();

    const captcha = new Captcha();
    captcha.solution = generatedCaptcha.text;
    captcha.token = randomstring.generate({ length: 32 });

    respond.success(res, {
      captchaImage: generatedCaptcha.data,
      captchaToken: captcha.token,
    });

    await captcha.save();
    logger.debug("Served new captcha %o", captcha);
  };
}

export default CaptchaController;
