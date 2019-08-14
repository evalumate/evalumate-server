import * as respond from "../utils/api-respond";
import Captcha from "../entities/captcha";
import config from "config";
import Controller from "../interfaces/controller";
import InvalidCaptchaTokenException from "../exceptions/InvalidCaptchaTokenException";
import randomstring from "randomstring";
import svgCaptcha from "svg-captcha";
import { createLogger } from "../utils/logger";
import { Request, Response, Router } from "express";

const logger = createLogger(module);

const captchaTtl: number = config.get("captcha.ttl");

class CaptchaController implements Controller {
  public path = "/captcha";
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.mGetNewCaptcha);
  }

  public static async createCaptcha(): Promise<Captcha> {
    logger.debug("Generating new captcha");
    const generatedCaptcha = svgCaptcha.create();

    const captcha = new Captcha();
    captcha.image = generatedCaptcha.data;
    captcha.solution = generatedCaptcha.text;
    captcha.token = randomstring.generate({ length: 32 });

    await captcha.save();
    return captcha;
  }

  private mGetNewCaptcha = async (req: Request, res: Response) => {
    const captcha = await CaptchaController.createCaptcha();

    logger.debug("Serving captcha with token %s", captcha.token);
    respond.success(res, {
      captcha: {
        image: captcha.image,
        token: captcha.token,
      },
    });
  };

  /**
   * Given a captcha token and a solution string, returns wether the solution is
   * correct.
   * @param token The token string that specifies the captcha
   * @param solution The solution to be validated
   *
   * @throws InvalidCaptchaTokenException if no captcha with the given token and
   * younger than `captcha.ttl` seconds exists.
   */
  public static async validateCaptchaSolution(
    token: string,
    solution: string
  ): Promise<boolean> {
    logger.debug("Validating captcha solution with token %s", token);
    const captcha = await Captcha.findAliveByToken(token, captchaTtl);
    if (!captcha) {
      throw new InvalidCaptchaTokenException();
    }

    const valid = solution === captcha.solution;
    if (valid) {
      await captcha.remove();
    }
    return valid;
  }
}

export default CaptchaController;
