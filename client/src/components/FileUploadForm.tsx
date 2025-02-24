import React, { useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle, Box, Typography} from '@mui/material'
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import request from '../utils/request';
import { useDispatch } from 'react-redux'
import { addMessage } from '../features/messageSlice'

interface FileUploadFormProps {
    onClose: () => void;
    channelId: string;
}

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const FileUploadForm: React.FC<FileUploadFormProps> = ({onClose,channelId}) => {
    const dispatch = useDispatch()
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>)=>{
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    }

    const formatFileSize = (size: number): string => {
        return size < 1024
            ? `${size} B`
            : size < 1024 * 1024
            ? `${(size / 1024).toFixed(1)} KB`
            : `${(size / 1024 / 1024).toFixed(1)} MB`;
    };

    const uploadFile = async () => {
        if(!selectedFile){
            return;
        }
        setUploading(true);
        try {
          const fileType = selectedFile.type; 
          const fileExtension = selectedFile.name.split('.').pop();
          const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
          const { uploadUrl, fileUrl } = await request(
            `/api/channels/${channelId}/file-upload-url`,
            { method: 'POST',
              body: JSON.stringify({
                fileName,
                fileType,
                fileExtension,
              }),
            }
          );
      
          console.log('Uploading file to:', uploadUrl);
      
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': fileType,
            },
            body: selectedFile,
          });
      
          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }
      
          const message = await request(
            `/api/channels/${channelId}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: fileUrl,
              }),
            }
          );
      
          dispatch(addMessage(message));
          console.log('File uploaded successfully:', fileUrl);
        } catch (error) {
          console.error('Error uploading file:', error);
        }finally{
          setUploading(false);
          onClose();
        }
    };
      

    return(
        <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>File Upload</DialogTitle>
            <DialogContent>
                <Box>
                    <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
                        Upload File
                        <VisuallyHiddenInput type="file" onChange={handleFile}/>
                    </Button>
                </Box>

                {selectedFile && (
                    <Box display="flex" alignItems="center" p={1} bgcolor="#F5F5F5" borderRadius={1} mt={2} mb={2}>
                        <InsertDriveFileIcon sx={{ fontSize: 40, color: "#FFA726", mr: 2 }} />
                        <Box>
                            <Typography variant="body1">{selectedFile.name}</Typography>
                            <Typography variant="body2" color="gray">
                                {formatFileSize(selectedFile.size)}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" mt={2}>
                    {selectedFile && !uploading &&<Button onClick={uploadFile} variant="contained">Sent</Button>}
                    {!uploading && <Button onClick={onClose} variant="outlined">Cancel</Button>}
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default FileUploadForm;

