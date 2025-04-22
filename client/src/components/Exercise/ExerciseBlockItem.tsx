import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
interface ExerciseBlockProps {
  index: number;
  guide: string;
  videoUrl?: string;
  onDelete: (index: number) => void;
  onChange: (index: number, field: "guide" | "videoUrl", value: string) => void;
  onValidate: (index: number, hasError: boolean) => void;
}

export default function ExerciseBlockItem({
  index,
  guide,
  videoUrl,
  onDelete,
  onChange,
  onValidate,
}: ExerciseBlockProps) {
  const convertYouTubeUrl = (url: string) => {
    if (url.includes("embed")) return url;
    const videoIdMatch = url.match(/(?:youtu\.be\/|v=)([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : "";
    return `https://www.youtube.com/embed/${videoId}`;
  };
  const isYouTubeUrl = (url: string) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/;
    return regex.test(url.trim());
  };

  useEffect(() => {
    const hasError = !guide.trim() || (!!videoUrl && !isYouTubeUrl(videoUrl));
    onValidate(index, hasError);
  }, [guide, videoUrl]);

  return (
    <Card sx={{ marginBottom: 2, padding: 1, position: "relative" }}>
      <IconButton
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
        onClick={() => onDelete(index)}
      >
        <CloseIcon />
      </IconButton>
      <CardContent>
        {videoUrl && isYouTubeUrl(videoUrl) && (
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <iframe
              width="300"
              height="170"
              src={convertYouTubeUrl(videoUrl)}
              title="YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Box>
        )}
        <Grid container spacing={2} direction="column">
          <Grid item xs={12}>
            <TextField
              label="Exercise Guide"
              value={guide}
              fullWidth
              onChange={(e) => onChange(index, "guide", e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="YouTube Video Link"
              value={videoUrl}
              fullWidth
              onChange={(e) => onChange(index, "videoUrl", e.target.value)}
              error={!!videoUrl && !isYouTubeUrl(videoUrl)}
              helperText={
                !!videoUrl && !isYouTubeUrl(videoUrl)
                  ? "Please enter a valid YouTube link"
                  : ""
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
