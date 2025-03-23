import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ReactNode } from 'react'
import Loading from './common/Loading'

export interface Column<T> {
  key: keyof T & string
  label?: string
  render?: (item: T) => ReactNode // Custom render function for cell
  align?: 'left' | 'center' | 'right'
  width?: string | number
  showInHeader?: boolean
}

export interface GenericItemizeContainerProps<T> {
  items?: T[]
  loading?: boolean
  getKey: (item: T) => string
  columns: Column<T>[]
  title?: string
  showHeader?: boolean
  emptyMessage?: string
}

const GenericItemizeContainer = <T,>({
  items = [],
  loading = false,
  getKey,
  columns = [],
  title,
  showHeader = true,
  emptyMessage = 'No items available',
}: GenericItemizeContainerProps<T>) => {
  // Only show columns in header that have showInHeader not explicitly set to false
  const headerColumns = columns.filter((col) => col.showInHeader !== false)
  const theme = useTheme()
  if (loading) return <Loading />

  return (
    <Box
      sx={{
        border: '1px solid black',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: 2,
        width: '100%',
      }}
    >
      {title && (
        <Box
          sx={{
            padding: 1,
            paddingLeft: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}

      <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          {showHeader && headerColumns.length > 0 && (
            <TableHead>
              <TableRow>
                {headerColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align || 'center'}
                    sx={{
                      fontWeight: 'bold',
                      padding: '8px 16px',
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      width: column.width,
                    }}
                  >
                    {column.label || ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}

          <TableBody>
            {!loading && (!items || items.length === 0) ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography>{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={getKey(item)}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${getKey(item)}-${column.key}`}
                      align={column.align || 'center'}
                      sx={{
                        padding: '8px 16px',
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        width: column.width,
                      }}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as T)[column.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default GenericItemizeContainer
