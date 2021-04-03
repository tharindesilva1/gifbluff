import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { wrap } from "comlink";

import "./reset.scss";
import "./base.scss";

import { SessionInfoProvider } from "./SessionContext";
import { Home } from "./views/Home/Home";
import { Session } from "./views/Session/Session";
import { ServerWorker } from "./server/worker";
import { AnimateSharedLayout } from "framer-motion";
import Landing from "./views/Landing/Landing";

function initServerWorker() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const worker = new Worker(new URL("./server/worker.ts", import.meta.url));

  // WebWorkers use `postMessage` and therefore work with Comlink.
  return wrap<ServerWorker>(worker);
}

const App = () => {
  const worker = initServerWorker();

  return (
    <BrowserRouter>
      <SessionInfoProvider serverWorker={worker}>
        <AnimateSharedLayout>
          <Switch>
            <Route path="/" exact component={Landing} />
            <Route path="/home" exact component={Home} />
            <Route path="/session" exact component={Session} />
            <Route
              path="/"
              render={() => <span>{"Huh, this page doesn't exist"}</span>}
            />
          </Switch>
        </AnimateSharedLayout>
      </SessionInfoProvider>
    </BrowserRouter>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
