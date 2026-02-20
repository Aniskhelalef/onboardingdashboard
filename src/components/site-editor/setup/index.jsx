'use client';

import { SetupProvider } from "./SetupContext";
import SetupShell from "./SetupShell";

const Setup = ({ initialStep, isModal = false, onClose }) => {
  return (
    <SetupProvider initialStep={initialStep} isModal={isModal} onClose={onClose}>
      <SetupShell />
    </SetupProvider>
  );
};

export default Setup;
