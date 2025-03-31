export function parseAlertContent(content: string) {
    const regex = /(?:CRITICAL\s+)?HELP-\s*Patient:\s*(.+?)\s*-\s*Nurses:\s*(\d+)\s*-\s*PatientID:\s*(\w+)/;
    const match = content.match(regex);
  
    if (!match) return null;
  
    const [, patientName, actualNurseCount, selectedPatientId] = match;
  
    return {
      patientName,
      actualNurseCount: Number(actualNurseCount),
      selectedPatientId: selectedPatientId,
    };
  }
  