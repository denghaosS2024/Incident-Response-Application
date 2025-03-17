import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ReactNode } from 'react'
import ItemList, { ItemListProps } from './GenericListItem'

export interface GenericListContainerProps<T> {
  header: ReactNode
  listProps: ItemListProps<T>
}

const GenericListContainer = <T,>({
  header,
  listProps,
}: GenericListContainerProps<T>) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        border: '2px solid black',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          borderBottom: '2px solid black',
          padding: '8px',
          backgroundColor: theme.palette.primary.light,
          color: 'white',
        }}
      >
        {header}
      </Typography>
      <ItemList<T> {...listProps} />
    </Box>
  )
}

export default GenericListContainer
