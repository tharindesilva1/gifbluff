import { ISession, PlayerRole } from "@gif/common";

export interface IClientSession extends ISession {
    selfRole: PlayerRole;
}