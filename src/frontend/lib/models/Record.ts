/**
 * Describes a record object as used by the API.
 */
export interface Record {
  id: number;
  time: number;
  registeredMembersCount: number;
  activeMembersCount: number;
  understandingMembersCount: number;
}
