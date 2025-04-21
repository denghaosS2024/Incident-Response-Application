import MissingPersonFollowUpForm from "@/components/feature/MissingPerson/MissingPersonFollowUpForm";
import { MissingPersonForm } from "@/components/feature/MissingPerson/MissingPersonForm";
import IMissingPerson from "@/models/MissingPersonReport";
import request, { IRequestError } from "@/utils/request";
import { Box, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

const PLACEHOLDER = "/images/placeholder.png";

const MissingPersonFollowUpPage: React.FC = () => {
    
    const { reportId } = useParams<{ reportId: string }>();
    const [person, setPerson] = useState<IMissingPerson | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string>(PLACEHOLDER);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [followUpReadOnly, setFollowUpReadOnly] = useState<boolean>(false);
    const [followUpId, setFollowUpId] = useState<string>("");

    useEffect(() => {
        if (!photoFile) {
          setPreviewSrc(PLACEHOLDER);
          return;
        }
        const objectUrl = URL.createObjectURL(photoFile);
        setPreviewSrc(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }, [photoFile]);

    useEffect(() => {
        if (!reportId) return;
    
        request<IMissingPerson>(
          `/api/missingPerson/report?id=${reportId}`,
          { method: "GET" },
          false,
        )
          .then((data) => {
            console.log(data);
            setPerson(data)})
          .catch((err) => {
            const e = err as IRequestError;
            setErrorMessage(e.message ?? "Failed to load report");
          });
        
          console.log(reportId);
    
      }, [reportId]);
    
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const readonlyParam = searchParams.get("readonly");
        const followUpIdParam = searchParams.get("followUpId");
        setFollowUpReadOnly(readonlyParam === "true");
        setFollowUpId(followUpIdParam!);
    })

    // show error if fetch failed
    if (errorMessage) {
        return <Typography color="error">{errorMessage}</Typography>;
    }
        
    const onSubmit = () => {
        console.log("Just Submit");
    }

    return (

        <Container>
            {/* Preview */}
        <Box
            component="img"
            src={previewSrc}
            alt="Missing person preview"
            sx={{
            width: 160,
            height: 160,
            objectFit: "cover",
            borderRadius: 2,
            mb: 2,
            display: "block",
            mx: "auto",
            }}
        />
            <MissingPersonForm initialData={person!} onSubmit={onSubmit} readonly={true}/>
            <MissingPersonFollowUpForm reportId={reportId!} readonly={followUpReadOnly} followUpId={followUpId} />
        </Container>
      
    );
  };
  
  export default MissingPersonFollowUpPage;
  