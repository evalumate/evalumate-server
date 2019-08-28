import DetailHttpException from "./DetailHttpException";

export default class EntityNotFoundException extends DetailHttpException {
  constructor(entityType: string) {
    super(404, "The requested entity was not found.", { entityType });
  }
}
