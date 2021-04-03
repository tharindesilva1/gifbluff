import React, { FunctionComponent, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

import styles from "./Home.module.scss";

import { RouteComponentProps } from "react-router-dom";
import { ISessionInfo, useSessionInfo } from "../../SessionContext";
import { createGameRequest } from "../../server/play-api";
import { validatePlayerId, validateSessionId } from "@gif/common";
import { proxy } from "comlink";
import Panel from "../components/Panel/Panel";
import { motion } from "framer-motion";
import Button from "../components/Button";

type HomeProps = RouteComponentProps;

enum HomeState {
  ROOT = "root",
  CREATE = "create",
  JOIN = "join",
}

const useInput = (lowercase = false) => {
  const [text, setText] = useState("");

  const setValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(lowercase ? e.target.value.toLowerCase() : e.target.value);
  };

  return { text, setValue };
};

export const Home: FunctionComponent<HomeProps> = ({ history }) => {
  useEffect(() => {
    saveSessionInfo({ sessionId: undefined });
  }, []);

  const { sessionInfo, saveSessionInfo, serverWorker } = useSessionInfo();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [creatingGame, setCreatingGame] = useState(false);
  const [homeState, setHomeState] = useState(HomeState.ROOT);
  const { text: playerId, setValue: setPlayerId } = useInput();
  const { text: sessionId, setValue: setSessionId } = useInput(true);

  const joinAllowed =
    !loading &&
    validatePlayerId(playerId) &&
    (homeState === HomeState.CREATE || validateSessionId(sessionId));

  const createGame = async () => {
    setCreatingGame(true);
    setHomeState(HomeState.CREATE);
  };

  const joinGame = () => {
    setCreatingGame(false);
    setHomeState(HomeState.JOIN);
  };

  const joinSession = async () => {
    setLoading(true);
    setError(false);
    try {
      let joiningSessionId = sessionId;
      if (creatingGame) {
        joiningSessionId = await createGameRequest();
      }
      const callback = (success: boolean) => {
        if (success) {
          const sessionInfo: ISessionInfo = {
            sessionId: joiningSessionId,
            playerId: playerId.trim(),
          };
          saveSessionInfo(sessionInfo);
          history.push("/session");
        } else setError(true);
      };
      await serverWorker.openWebsocket(
        joiningSessionId,
        playerId,
        proxy(callback)
      );
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  };

  const goBack = () => {
    setHomeState(HomeState.ROOT);
  };

  const renderForm = () => {
    const motionProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    };

    return (
      <div className={styles.home}>
        <Panel className={styles.form}>
          <FaArrowLeft className={styles.backButton} onClick={goBack} />
          {!creatingGame && (
            <motion.label {...motionProps}>{"Room code:"}</motion.label>
          )}
          {!creatingGame && (
            <motion.input
              {...motionProps}
              onChange={setSessionId}
              value={sessionId}
              placeholder={"5 character code"}
            ></motion.input>
          )}
          {<motion.label {...motionProps}>{"Your name:"}</motion.label>}
          <motion.input
            {...motionProps}
            onChange={setPlayerId}
            value={playerId}
            placeholder={"Up to 12 character"}
          ></motion.input>
          {error && (
            <motion.small {...motionProps}>
              {`Failed to ${creatingGame ? "create" : "join"} game :(`}
            </motion.small>
          )}
          <Button disabled={!joinAllowed} onClick={joinSession}>
            {"Play"}
          </Button>
        </Panel>
      </div>
    );
  };

  const renderRoot = () => {
    return (
      <div className={styles.home}>
        <Panel className={styles.root}>
          <Button className={styles.rootButtons} onClick={createGame}>
            {"Create game"}
          </Button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.spacer}
          >
            {"OR"}
          </motion.p>
          <Button className={styles.rootButtons} onClick={joinGame}>
            {"Join game"}
          </Button>
        </Panel>
      </div>
    );
  };

  return homeState === HomeState.ROOT ? renderRoot() : renderForm();
};
