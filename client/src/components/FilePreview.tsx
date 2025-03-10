import React from "react";
import { Box, Typography } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

interface FilePreviewProps {
  filename: string;
  size: number;
}

const FilePreview: React.FC<FilePreviewProps> = ({ filename, size }) => {

    const formatFileSize = (size: number): string => {
        return size < 1024
            ? `${size} B`
            : size < 1024 * 1024
            ? `${(size / 1024).toFixed(1)} KB`
            : `${(size / 1024 / 1024).toFixed(1)} MB`;
    };
  return (
    <Box display="flex" alignItems="center" p={1} bgcolor="#F5F5F5" borderRadius={1} mt={2} mb={2}>
      <InsertDriveFileIcon sx={{ fontSize: 40, color: "#FFA726", mr: 2 }} />
      <Box>
        <Typography variant="body1">{filename}</Typography>
        <Typography variant="body2" color="gray">
          {formatFileSize(size)}
        </Typography>
      </Box>
    </Box>
  );
};

export default FilePreview;
