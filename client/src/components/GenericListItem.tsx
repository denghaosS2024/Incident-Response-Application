import { Divider, List, Typography } from '@mui/material'
import { Fragment, ReactNode } from 'react'
import Loading from './common/Loading'

export interface ItemListProps<T> {
  items?: T[]
  loading: boolean
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
}

const ItemList = <T,>({
  items,
  loading,
  getKey,
  renderItem,
}: ItemListProps<T>) => {
  if (loading) return <Loading />

  if (!items || items.length === 0) {
    return (
      <Typography style={{ padding: 16 }}>No Incidents available</Typography>
    )
  }

  return (
    <List>
      {items.map((item, index) => (
        <Fragment key={getKey(item)}>
          {renderItem(item)}
          {index !== items.length - 1 && <Divider />}
        </Fragment>
      ))}
    </List>
  )
}

export default ItemList
