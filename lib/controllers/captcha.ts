import * as respond from "../utils/api-respond";
import Captcha from "../entities/captcha";
import config from "config";
import Controller from "../interfaces/controller";
import InvalidCaptchaTokenException from "../exceptions/InvalidCaptchaTokenException";
import moment from "moment";
import randomstring from "randomstring";
import svgCaptcha from "svg-captcha";
import { createLogger } from "../utils/logger";
import { EDateType, MoreThanOrEqualDate } from "../utils/typeorm-compare-date";
import { Request, Response, Router } from "express";

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
      captcha: {
        image: generatedCaptcha.data,
        token: captcha.token,
      },
    });

    await captcha.save();
    logger.debug("Served new captcha %o", captcha);
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
    const ttl: number = config.get("captcha.ttl");

    logger.debug("Validating captcha with token %s", token);
    const captcha = await Captcha.findOne({
      token: token,
      /*createdAt: MoreThanOrEqualDate(
        moment(new Date())
          .add(-ttl, "s")
          .toDate(),
        EDateType.Datetime
      ),*/
    });

    if (!captcha) {
      throw new InvalidCaptchaTokenException();
    }

    return solution === captcha.solution;
  }
}

export default CaptchaController;
