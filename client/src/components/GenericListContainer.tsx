import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ItemList, { ItemListProps } from './GenericListItem'

export interface GenericListContainerProps<T> {
  header: string | string[]
  listProps: ItemListProps<T>
}

const GenericListContainer = <T,>({
  header,
  listProps,
}: GenericListContainerProps<T>) => {
  const theme = useTheme()
  const isHeaderArray = Array.isArray(header)

  return (
    <Box
      sx={{
        border: '1px solid black',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: 2,
      }}
    >
      {/* If header is a string, render it as a title */}
      {!isHeaderArray && (
        <Typography
          variant="h6"
          sx={{
            padding: 1.5,
            backgroundColor: theme.palette.primary.main,
            borderBottom: '1px solid',
            color: theme.palette.primary.contrastText,
          }}
        >
          {header}
        </Typography>
      )}

      {/* Table for both header and rows */}
      <TableContainer sx={{ width: '100%', overflowX: 'hidden' }}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          {isHeaderArray && (
            <TableHead>
              <TableRow>
                {header.map((headerItem, index) => (
                  <TableCell
                    key={index}
                    sx={{ fontWeight: 'bold' }}
                    align="center"
                  >
                    {headerItem}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}

          {/* Render Rows (List of items) */}
          <ItemList<T> {...listProps} />
        </Table>
      </TableContainer>
    </Box>
  )
}

export default GenericListContainer
