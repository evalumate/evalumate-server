import Fixture from "./Fixture";
import CaptchaController from "../../lib/controllers/CaptchaController";
import SessionController from "../../lib/controllers/SessionController";
import Captcha from "../../lib/entities/Captcha";
import Session from "../../lib/entities/Session";
import faker from "faker";
import MemberController from "../../lib/controllers/MemberController";
import Member from "../../lib/entities/Member";

export class CaptchaFixture extends Fixture<Captcha> {
  private instance: Captcha;

  async setUp() {
    this.instance = await CaptchaController.createCaptcha();
    return this.instance;
  }

  async tearDown() {
    await this.instance.remove();
  }
}

export class SessionFixture extends Fixture<Session> {
  private instance: Session;

  async setUp(captchaRequired?: boolean) {
    if (typeof captchaRequired === "undefined") {
      captchaRequired = faker.random.boolean();
    }
    this.instance = await SessionController.createSession(
      faker.lorem.words(faker.random.number({ min: 1, max: 5 })),
      captchaRequired
    );
    return this.instance;
  }

  async tearDown() {
    await this.instance.remove();
  }
}

export class MemberFixture extends Fixture<Member> {
  private sessionFixture: SessionFixture;
  private session: Session;
  private instances: Member[];

  constructor() {
    super();
    this.sessionFixture = new SessionFixture();
    this.instances = [];
  }

  /**
   * Sets up a new member. If no session is provided, creates a new session using an instance of
   * SessionFixture.
   *
   * @param session The session that the new user will belong to
   */
  async setUp(session?: Session) {
    if (!session) {
      if (!this.session) {
        this.session = await this.sessionFixture.setUp();
      }
      session = this.session;
    }
    const member = await MemberController.createMember(session);
    this.instances.push(member);
    return member;
  }

  async tearDown() {
    if (this.session) {
      // Deleting the session also deletes all of its members
      this.sessionFixture.tearDown();
      this.session = undefined;
    }
    if (this.instances.length > 0) {
      this.instances.forEach(instance => {
        instance.remove();
      });
      this.instances = [];
    }
  }
}
