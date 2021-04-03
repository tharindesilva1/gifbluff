import React, { FunctionComponent, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { proxy } from "comlink";

import { SessionStatus } from "@gif/common";

import styles from "./Session.module.scss";

import { useSessionInfo } from "../../SessionContext";
import LobbyView from "./LobbyView/LobbyView";
import { IClientSession } from "../../typings/client";
import SelectGifView from "./SelectGifView/SelectGifView";
import VotePlayerView from "./VotePlayerView/VotePlayerView";
import Panel from "../components/Panel/Panel";
import EndGameView from "./EndGameView/EndGameView";
import StageTracker from "../components/StageTracker/StageTracker";

type SessionProps = RouteComponentProps;

export const Session: FunctionComponent<SessionProps> = ({ history }) => {
  const { sessionInfo, serverWorker } = useSessionInfo();

  const [sessionState, setSessionState] = useState<IClientSession>();
  const startGame = async () => {
    await serverWorker.startGame();
  };

  const onStateChange = (state: IClientSession) => {
    setSessionState(state);
  };

  const goHome = () => {
    history.push("/home");
  };

  useEffect(() => {
    const callback = (success: boolean) => {
      if (!success) goHome();
    };
    if (!sessionInfo?.sessionId || !sessionInfo?.playerId)
      history.push("./home");
    else {
      serverWorker.openWebsocket(
        sessionInfo.sessionId,
        sessionInfo?.playerId,
        proxy(callback)
      );
      serverWorker.registerStateCallback(proxy(onStateChange));
    }

    // setTimeout(() => {
    //     setSessionState((state) => {
    //         return ({ ...state, status: SessionStatus.END })
    //     })
    // }, 6000)
    return () => {
      serverWorker.disconnect();
    };
  }, []);

  const getPanelStyles = () => {
    return [
      styles.basePanel,
      sessionState?.status === SessionStatus.LOBBY && styles.lobbyView,
      sessionState?.status === SessionStatus.GIF_SELECT && styles.selectGifView,
      sessionState?.status === SessionStatus.VOTE && styles.votePlayerView,
      sessionState?.status === SessionStatus.END && styles.endGameView,
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className={styles.session}>
      {sessionState?.status && <StageTracker status={sessionState.status} />}
      <Panel className={getPanelStyles()}>
        {sessionState?.status === SessionStatus.LOBBY && (
          <LobbyView
            players={sessionState.players}
            sessionId={sessionInfo!.sessionId!}
            onStartGame={startGame}
          />
        )}
        {sessionState?.status === SessionStatus.GIF_SELECT && (
          <SelectGifView
            question={sessionState.question}
            role={sessionState.selfRole}
            timeLeft={sessionState.timeLeft!}
          />
        )}
        {sessionState?.status === SessionStatus.VOTE && (
          <VotePlayerView
            players={sessionState.players}
            question={sessionState.question}
            role={sessionState?.selfRole!}
            selfId={sessionInfo!.playerId!}
            timeLeft={sessionState.timeLeft!}
          />
        )}
        {sessionState?.status === SessionStatus.END && (
          <EndGameView
            players={sessionState.players}
            role={sessionState.selfRole}
            selfId={sessionInfo!.playerId!}
            onGoHome={goHome}
          />
        )}
      </Panel>
    </div>
  );
};
