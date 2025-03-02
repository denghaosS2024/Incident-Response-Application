import { Meta, StoryObj } from '@storybook/react';
import GenericListContainer, { GenericListContainerProps } from '../components/GenericListContainer';
import { IconButton, ListItem, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { NavigateNext as Arrow } from '@mui/icons-material';
import { action } from '@storybook/addon-actions';

// Default export (meta) required by Storybook CSF
const meta: Meta<typeof GenericListContainer> = {
  title: 'Components/GenericListContainer',
  component: GenericListContainer,
  tags: ['autodocs'],
};

export default meta;

// Now you can create individual stories below:
interface SimpleItem {
  name: string;
}

export const Default: StoryObj<GenericListContainerProps<SimpleItem>> = {
    args: {
      header: 'My Simple List',
      listProps: {
        items: [{ name: 'Alice' }, { name: 'Bob' }],
        loading: false,
        getKey: (item: SimpleItem) => item.name,
        renderItem: (item: SimpleItem) => (
            <ListItem button>
                <ListItemText primary={item.name} />
                <ListItemSecondaryAction>
                    <IconButton edge="end" size="large" onClick={action('chat with')}>
                    <Arrow />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        ),
      },
    },
  };
