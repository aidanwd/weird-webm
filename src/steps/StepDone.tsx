import { Grid, Box, Button, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "..";

export default function StepDone() {
  const videoUrl = useSelector((state: RootState) => state.fileUrl);

  const downloadFile = () => {
    var a = document.createElement("a");
    a.hidden = true;
    document.body.appendChild(a);
    a.href = videoUrl;
    a.download = "wacky.webm";
    a.click();
  }

  const divStyle = {
    width: '100%',
    height: '100%',
  };

  return (
    <div>
      <Box mt={2} mb={2}>
        <Grid container direction="column" alignItems="center" justifyContent="center">
          <Typography mb={2} component="h6" variant="h6" >
            Completed processing video
          </Typography>
        </Grid>
        <video style={divStyle} src={videoUrl} controls></video>
        <Stack mt={1} spacing={4}>
          <Button variant="contained" onClick={downloadFile}>Download</Button>
        </Stack>
      </Box>
    </div>
  );
}
