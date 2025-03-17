import { Box, Card, CardActionArea, Typography, Zoom } from '@mui/material'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import IIncident, { IncidentType } from '../../models/Incident'
import { updateIncident } from '../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../redux/store'

// Icons for emergency types
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'

const Reach911Step2: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )

  const handleTypeSelection = (type: IncidentType) => {
    dispatch(
      updateIncident({
        ...incident,
        type: type,
      }),
    )
  }

  // Helper function to determine if a card is selected
  const isSelected = (type: IncidentType) => incident.type === type

  return (
    <Box
      sx={{
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        px: 2,
        pb: 1,
        boxSizing: 'border-box',
        mt: '10px',
        p: '10px',
      }}
    >
      <Box>
        <Typography variant="h6" align="center" sx={{ mb: 0.5 }}>
          What type of emergency are you experiencing?
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          flex: 1,
          overflow: 'hidden',
          my: 0.5,
        }}
      >
        {/* Fire Emergency Card */}
        <Card
          elevation={isSelected(IncidentType.Fire) ? 3 : 1}
          sx={{
            borderRadius: 1,
            transition: 'all 0.3s ease',
            height: isSelected(IncidentType.Fire) ? '35%' : '28%',
            position: 'relative',
            backgroundColor: isSelected(IncidentType.Fire)
              ? 'rgba(244, 67, 54, 0.05)'
              : 'white',
            boxShadow: isSelected(IncidentType.Fire)
              ? '0 2px 8px rgba(244, 67, 54, 0.2)'
              : 'none',
            borderTop: isSelected(IncidentType.Fire)
              ? '4px solid #f44336'
              : 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <CardActionArea
            onClick={() => handleTypeSelection(IncidentType.Fire)}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: isSelected(IncidentType.Fire) ? 1.5 : 1,
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                position: 'relative',
              }}
            >
              {isSelected(IncidentType.Fire) && (
                <Zoom in={true}>
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: 16,
                      color: '#f44336',
                      fontSize: 24,
                    }}
                  />
                </Zoom>
              )}
              <LocalFireDepartmentIcon
                sx={{
                  fontSize: isSelected(IncidentType.Fire) ? 48 : 36,
                  color: '#f44336',
                  mb: 0.5,
                  transition: 'all 0.3s ease',
                }}
              />
              <Typography
                variant="subtitle1"
                align="center"
                sx={{
                  fontWeight: isSelected(IncidentType.Fire) ? 'bold' : 'medium',
                  fontSize: isSelected(IncidentType.Fire) ? '1.1rem' : '1rem',
                  lineHeight: 1.2,
                }}
              >
                Fire
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}
              >
                Report a fire emergency
              </Typography>
            </Box>
          </CardActionArea>
        </Card>

        {/* Medical Emergency Card */}
        <Card
          elevation={isSelected(IncidentType.Medical) ? 3 : 1}
          sx={{
            borderRadius: 1,
            transition: 'all 0.3s ease',
            height: isSelected(IncidentType.Medical) ? '35%' : '28%',
            position: 'relative',
            backgroundColor: isSelected(IncidentType.Medical)
              ? 'rgba(33, 150, 243, 0.05)'
              : 'white',
            boxShadow: isSelected(IncidentType.Medical)
              ? '0 2px 8px rgba(33, 150, 243, 0.2)'
              : 'none',
            borderTop: isSelected(IncidentType.Medical)
              ? '4px solid #2196f3'
              : 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <CardActionArea
            onClick={() => handleTypeSelection(IncidentType.Medical)}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: isSelected(IncidentType.Medical) ? 1.5 : 1,
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                position: 'relative',
              }}
            >
              {isSelected(IncidentType.Medical) && (
                <Zoom in={true}>
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: 16,
                      color: '#2196f3',
                      fontSize: 24,
                    }}
                  />
                </Zoom>
              )}
              <LocalHospitalIcon
                sx={{
                  fontSize: isSelected(IncidentType.Medical) ? 48 : 36,
                  color: '#2196f3',
                  mb: 0.5,
                  transition: 'all 0.3s ease',
                }}
              />
              <Typography
                variant="subtitle1"
                align="center"
                sx={{
                  fontWeight: isSelected(IncidentType.Medical)
                    ? 'bold'
                    : 'medium',
                  fontSize: isSelected(IncidentType.Medical)
                    ? '1.1rem'
                    : '1rem',
                  lineHeight: 1.2,
                }}
              >
                Medical
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}
              >
                Report a medical emergency
              </Typography>
            </Box>
          </CardActionArea>
        </Card>

        {/* Police Emergency Card */}
        <Card
          elevation={isSelected(IncidentType.Police) ? 3 : 1}
          sx={{
            borderRadius: 1,
            transition: 'all 0.3s ease',
            height: isSelected(IncidentType.Police) ? '35%' : '28%',
            position: 'relative',
            backgroundColor: isSelected(IncidentType.Police)
              ? 'rgba(76, 175, 80, 0.05)'
              : 'white',
            boxShadow: isSelected(IncidentType.Police)
              ? '0 2px 8px rgba(76, 175, 80, 0.2)'
              : 'none',
            borderTop: isSelected(IncidentType.Police)
              ? '4px solid #4caf50'
              : 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <CardActionArea
            onClick={() => handleTypeSelection(IncidentType.Police)}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: isSelected(IncidentType.Police) ? 1.5 : 1,
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                position: 'relative',
              }}
            >
              {isSelected(IncidentType.Police) && (
                <Zoom in={true}>
                  <CheckCircleIcon
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: 16,
                      color: '#4caf50',
                      fontSize: 24,
                    }}
                  />
                </Zoom>
              )}
              <LocalPoliceIcon
                sx={{
                  fontSize: isSelected(IncidentType.Police) ? 48 : 36,
                  color: '#4caf50',
                  mb: 0.5,
                  transition: 'all 0.3s ease',
                }}
              />
              <Typography
                variant="subtitle1"
                align="center"
                sx={{
                  fontWeight: isSelected(IncidentType.Police)
                    ? 'bold'
                    : 'medium',
                  fontSize: isSelected(IncidentType.Police) ? '1.1rem' : '1rem',
                  lineHeight: 1.2,
                }}
              >
                Police
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}
              >
                Report a police emergency
              </Typography>
            </Box>
          </CardActionArea>
        </Card>
      </Box>

      {incident.type !== IncidentType.Unset && (
        <Typography
          variant="body2"
          align="center"
          sx={{
            fontWeight: 'bold',
            fontSize: '1rem',
            lineHeight: 1.2,
            p: '10px',
            color:
              incident.type === IncidentType.Fire
                ? '#f44336'
                : incident.type === IncidentType.Medical
                  ? '#2196f3'
                  : '#4caf50',
          }}
        >
          You've selected:{' '}
          {incident.type === IncidentType.Fire
            ? 'Fire'
            : incident.type === IncidentType.Medical
              ? 'Medical'
              : 'Police'}{' '}
          emergency
        </Typography>
      )}
    </Box>
  )
}

export default Reach911Step2
