import Session from "./Session";
import { getUnixTimestamp } from "../utils/time";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export default class Record extends BaseEntity {
  @PrimaryColumn("int")
  id: number;

  @ManyToOne(type => Session, session => session.records, { onDelete: "CASCADE" })
  session: Session;

  @PrimaryColumn()
  sessionId: string;

  @Column()
  registeredMembersCount: number;

  @Column()
  activeMembersCount: number;

  @Column()
  understandingMembersCount: number;

  /**
   * The creation time as a UNIX timestamp
   */
  @Column("int", { default: getUnixTimestamp })
  time: number;
}
