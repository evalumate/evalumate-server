import Session from "./Session";
import { getUnixTimestamp } from "../utils/time";
import { Column, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class Record {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(type => Session, session => session.records, { onDelete: "CASCADE" })
  session: Session;

  @Column()
  @Index()
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
  @Index()
  time: number;
}
