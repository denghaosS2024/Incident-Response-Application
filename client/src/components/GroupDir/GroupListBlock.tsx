import { Box, List, ListItem, Typography } from '@mui/material'
import IChannel from '../../models/Channel'
import { Channel } from '../ChannelList'

interface GroupListBlockProps {
  headerName: string
  id: string
  groups: IChannel[]
}

const GroupListBlock: React.FC<GroupListBlockProps> = ({
  headerName,
  id,
  groups,
}) => {
  return (
    <div>
      <div className="group-subheader" id={id}>
        <ListItem sx={{
          padding: '10px 10px',
          marginBottom: '8px',
          width: '100%',
          marginTop: '5px',
          lineHeight: "40px",  /* Matches the height */
          display: 'flex',
          justifyContent: 'center',

        }}>
          <Typography variant="h6" fontWeight="bold">
          {headerName}
          </Typography>
        </ListItem>
      </div>

      <List className="group-item" sx={{ width: '300px' }}>
        {groups.map((group) => (
          <ListItem
            key={group._id}
            disablePadding
            
            sx={{
              border: '1.5px solid #ddd',
              borderRadius: '8px',
              backgroundColor:  '#fff',
              marginBottom: '8px',
              width: '100%',
              marginTop: '5px',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
              height: '60px'

            }}
          >
            <Box sx={{margin: 'auto', paddingLeft: '20px', width: '300px'}}>
              <Channel channel={group} isSettingButton={true} sx={{ backgroundColor: 'transparent', color: 'black', boxShadow: 'none', padding: '0px'}}
               settingButtonSx={{ paddingLeft: '30px'}} settingButtonLinkSx={{ textDecoration: 'none'}} />
            </Box>
          </ListItem>
        ))}
      </List>
    </div>
  )
}

export default GroupListBlock
