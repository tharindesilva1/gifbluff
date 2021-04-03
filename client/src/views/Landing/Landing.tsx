import React, { FunctionComponent } from "react";

import styles from "./Landing.module.scss";

import { RouteComponentProps } from "react-router-dom";
import { EditedLogoText, Logo } from "../components/icons";
import { motion } from "framer-motion";
type LandingProps = RouteComponentProps;

const Landing: FunctionComponent<LandingProps> = ({ history }) => {
  const onEnter = () => history.push("/home");
  return (
    <div className={styles.landing}>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 1, staggerChildren: 2 }}
        className={styles.logoContainer}
      >
        <Logo className={styles.logo} />
        <EditedLogoText className={styles.editedLogoText} />
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className={styles.enter}
          onClick={onEnter}
        >
          {"Enter"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Landing;
