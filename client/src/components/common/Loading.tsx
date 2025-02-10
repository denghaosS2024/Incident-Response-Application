import { Skeleton } from '@mui/material'
import { Fragment, FunctionComponent } from 'react'

// interface ILoadingProps {}

const Loading: FunctionComponent = () => (
  <Fragment>
    <Skeleton style={{ marginTop: 10 }} />
    <Skeleton animation={false} />
    <Skeleton animation="wave" />
  </Fragment>
)

export default Loading
