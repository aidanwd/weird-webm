import { createFFmpeg } from "@ffmpeg/ffmpeg";
import * as React from 'react';
import { useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box'
import '@fontsource/roboto';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import CssBaseline from '@mui/material/CssBaseline';
import {
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Container } from "@mui/system";
import Grid from "@mui/material/Grid";
import StepUpload from "./steps/StepUpload";
import StepConfigure from "./steps/StepConfigure";
import StepDone from "./steps/StepDone";
import { useSelector } from "react-redux";
import { RootState } from ".";
import StepProcess from "./steps/StepProcess";

const ffmpeg = createFFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  log: false,
});

enum EStep {
  Upload,
  Configure,
  Process,
  Done,
}
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const activeStep = useSelector((state: RootState) => state.activeStep);

  useEffect(() => {
    if (!ffmpeg.isLoaded()) {
      ffmpeg.load();
    }
  }, []);

  const renderStep = () => {
    switch (activeStep) {
      case EStep.Upload:
        return <StepUpload ffmpeg={ffmpeg} />;
      case EStep.Configure:
        return <StepConfigure />;
      case EStep.Process:
        return <StepProcess ffmpeg={ffmpeg} />;
      case EStep.Done:
        return <StepDone />;
    }
  };

  return (
    <React.Fragment>
    <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <Container >
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Typography mt={2} mb={2} component="h4" variant="h4" > 
        WackyWebM Creator
      </Typography>
  </Grid>
      <Stepper activeStep={activeStep}>
        <Step>
          <StepLabel>Upload Video</StepLabel>
        </Step>
        <Step>
          <StepLabel>Configure</StepLabel>
        </Step>
        <Step>
          <StepLabel>Process</StepLabel>
        </Step>
        <Step>
          <StepLabel>Done</StepLabel>
        </Step>
      </Stepper>
      {renderStep()}
    </Container>
  </ThemeProvider>
  </React.Fragment>
  );
}

export default App;
