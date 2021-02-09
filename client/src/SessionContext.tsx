import { Remote } from "comlink";
import React, { createContext, useCallback, useContext, useState } from "react";
import { ServerWorker } from "./server/worker";

export interface ISessionInfo {
    sessionId?: string;
    playerId?: string;
}

interface ContextProps {
    sessionInfo?: ISessionInfo;
    serverWorker: Remote<ServerWorker>;
    saveSessionInfo: (newSessionInfo: ISessionInfo) => void;
}

const SESSION_ID_STORAGE_KEY = "@localStorage/SESSION_ID";

export const HOST_PLACEHOLDER_ID = "HOST_PLACEHOLDER_ID";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const sessionInfoContext = createContext<ContextProps>({ saveSessionInfo: () => { return } });

export const useSessionInfo = (): ContextProps => useContext(sessionInfoContext);

const getStoredSessionInfo = (): ISessionInfo | undefined => {
    const storedSessionInfo = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (storedSessionInfo) {
        return JSON.parse(storedSessionInfo);
    }
}

interface SessionInfoProviderProps {
    serverWorker: Remote<ServerWorker>;
    children: React.ReactNode;
}

export const SessionInfoProvider = ({
    serverWorker,
    children,
}: SessionInfoProviderProps): JSX.Element => {

    const [sessionInfo, setSessionInfo] = useState(getStoredSessionInfo);

    const saveSessionInfo = useCallback((newSessionInfo: ISessionInfo) => {
        sessionStorage.setItem(SESSION_ID_STORAGE_KEY, JSON.stringify(newSessionInfo));
        setSessionInfo(newSessionInfo);
    }, [setSessionInfo])

    return (
        <sessionInfoContext.Provider value={{ sessionInfo, saveSessionInfo, serverWorker }}>
            {children}
        </sessionInfoContext.Provider>
    )
}