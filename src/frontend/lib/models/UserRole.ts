/**
 * The role of the app user
 */
export enum UserRole {
  /**
   * The app user is just a visitor and has not yet created or joined a session
   */
  Visitor,
  /**
   * The app user is a member of a session
   */
  Member,
  /**
   * The app user is the owner of a session
   */
  Owner,
}
