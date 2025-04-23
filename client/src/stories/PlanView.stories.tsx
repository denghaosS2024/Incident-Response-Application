import React from 'react'
import { Box, Typography } from '@mui/material'
import type { Meta, StoryFn } from '@storybook/react'

const ExerciseVideoBlock: React.FC<{ guide: string; url: string }> = ({ guide, url }) => {
  const isYouTube = url.includes('youtube.com/watch') || url.includes('youtu.be')
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)
  const videoId = match?.[1]

  const videoContent = isYouTube && videoId ? (
    <iframe
      width="100%"
      height="315"
      src={`https://www.youtube.com/embed/${videoId}`}
      title="Exercise video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ marginTop: 8, borderRadius: 8 }}
    />
  ) : (
    <video width="100%" controls style={{ marginTop: 8, borderRadius: 8 }}>
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )

  return (
    <Box mt={3}>
      <Typography variant="body2" gutterBottom>
        {guide}
      </Typography>
      {videoContent}
    </Box>
  )
}

export default {
    title: 'Components/ExerciseVideoBlock',
    component: ExerciseVideoBlock,
  } as Meta<typeof ExerciseVideoBlock>
  
  export const YouTubeVideo: StoryFn<typeof ExerciseVideoBlock> = () => (
    <ExerciseVideoBlock
      guide="Start with a warm-up."
      url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    />
  )
  
  export const Mp4Video: StoryFn<typeof ExerciseVideoBlock> = () => (
    <ExerciseVideoBlock
      guide="Breathe steadily and focus."
      url="https://www.w3schools.com/html/mov_bbb.mp4"
    />
  )
 