import MissingPersonFollowUpForm from "@/components/feature/MissingPerson/MissingPersonFollowUpForm";
import { MissingPersonForm } from "@/components/feature/MissingPerson/MissingPersonForm";
import { Container } from "@mui/material";
import React from "react";

const MissingPersonFollowUpPage: React.FC = () => {
    
    const onSubmit = () => {
        console.log("Just Submit");
    }
    return (

        <Container>
            <MissingPersonForm onSubmit={onSubmit} readonly={true}/>
            <MissingPersonFollowUpForm reportId="placeholder" />
        </Container>
      
    );
  };
  
  export default MissingPersonFollowUpPage;
  