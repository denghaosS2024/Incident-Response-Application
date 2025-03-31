import React from 'react'
import { Box, Typography, Paper } from '@mui/material'


/**
 * Props for the FEMAMarker component
 */
interface FEMAMarkerProps {
  /** Text for top side */
  top?: string
  /** Text for right side */
  right?: string
  /** Text for bottom side */
  bottom?: string
  /** Text for left side */
  left?: string
  /** Size of the marker in pixels */
  size?: number
  /** Stroke width of the X in pixels */
  strokeWidth?: number
  /** Color of the X */
  strokeColor?: string
  /** Color of the text */
  textColor?: string
  /** Background color of the marker */
  backgroundColor?: string
}

/**
 * FEMAMarker component - Displays an X marker with text in the middle of each side
 * If only left is provided, only displays a diagonal line from top-left to bottom-right
 */
const FEMAMarker: React.FC<FEMAMarkerProps> = ({
     top = '',
     right = '',
     bottom = '',
     left = '',
     size = 200,
     strokeWidth = 6,
     strokeColor = '#FF0000',
     textColor = '#000000',
     backgroundColor = '#FFFFFF',
   }) => {
  // Calculate padding based on size for consistent proportions
  const padding = size * 0.1

  // Determine if we should only show a single diagonal line (only top has content)
  const showOnlyDiagonal = left && !top && !right && !bottom

  // Font size based on marker size for responsive text
  const fontSize = size * 0.06

  return (
    <Paper
      elevation={3}
      sx={{
        width: size,
        height: size,
        backgroundColor,
        position: 'relative',
        padding: `${padding}px`,
        boxSizing: 'border-box',
      }}
    >
      {/* Diagonal line from top-left to bottom-right */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: Math.sqrt(2) * size, // Length for a full diagonal across the square
            height: strokeWidth,
            backgroundColor: strokeColor,
            transformOrigin: 'top left',
            transform: 'rotate(45deg)',
            top: 0,
            left: 0,
          }
        }}
      />

      {/* Diagonal line from top-right to bottom-left (only if not showing only the first diagonal) */}
      {!showOnlyDiagonal && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: Math.sqrt(2) * size, // Length for a full diagonal across the square
              height: strokeWidth,
              backgroundColor: strokeColor,
              transformOrigin: 'top right',
              transform: 'rotate(-45deg)',
              top: 0,
              right: 0,
            }
          }}
        />
      )}

      {/* Top text */}
      {!showOnlyDiagonal && top && (
        <Typography
          sx={{
            position: 'absolute',
            top: padding - (fontSize / 2),
            left: '50%',
            transform: 'translateX(-50%)',
            color: textColor,
            fontWeight: 'bold',
            fontSize: fontSize,
            padding: '0 8px',
            // backgroundColor,
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          {top}
        </Typography>
      )}

      {/* Right text */}
      {!showOnlyDiagonal && right && (
        <Typography
          sx={{
            position: 'absolute',
            right: padding,
            left: '65%',
            top: '50%',
            transform: 'translateY(-50%)',
            color: textColor,
            fontWeight: 'bold',
            fontSize: fontSize,
            // padding: '0 8px',
            // backgroundColor,
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          {right}
        </Typography>
      )}

      {/* Bottom text */}
      {!showOnlyDiagonal && bottom && (
        <Typography
          sx={{
            position: 'absolute',
            bottom: padding - (fontSize / 2),
            left: '50%',
            transform: 'translateX(-50%)',
            color: textColor,
            fontWeight: 'bold',
            fontSize: fontSize,
            padding: '0 8px',
            // backgroundColor,
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          {bottom}
        </Typography>
      )}

      {/* Left text */}
      {left && (
        <Typography
          sx={{
            position: 'absolute',
            // left: padding,
            right: '65%',
            top: '50%',
            transform: 'translateY(-50%)',
            color: textColor,
            fontWeight: 'bold',
            fontSize: fontSize,
            // padding: '0 8px',
            // backgroundColor,
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          {left}
        </Typography>
      )}
    </Paper>
  );
};

export default FEMAMarker
