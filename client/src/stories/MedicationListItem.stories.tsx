import { ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Meta, StoryObj } from '@storybook/react';

const MedicationListItem = (props: {
  name: string;
  frequency: string;
  time: string;
  route: string;
  notes?: string;
  onDelete?: () => void;
}) => {
  return (
    <ListItem
      sx={{ cursor: 'pointer' }}
      secondaryAction={
        <IconButton edge="end" aria-label="delete" onClick={props.onDelete}>
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemText
        primary={`${props.name} (${props.frequency}, ${props.time}, ${props.route})`}
        secondary={props.notes}
      />
    </ListItem>
  );
};

const meta: Meta<typeof MedicationListItem> = {
  title: 'PatientPlan/MedicationListItem',
  component: MedicationListItem,
};

export default meta;

type Story = StoryObj<typeof MedicationListItem>;

export const Default: Story = {
  args: {
    name: 'Ibuprofen',
    frequency: 'Once a day',
    time: 'Evening',
    route: 'Oral',
    notes: 'Take after food',
    onDelete: () => alert('delete clicked'),
  },
};
