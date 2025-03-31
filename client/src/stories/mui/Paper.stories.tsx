import { Paper, PaperProps } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<PaperProps> = {
    title: 'Material UI/Paper',
    component: Paper,
    tags: ['autodocs'],
    argTypes: {
        elevation: {
            control: { type: 'number' },
            description: 'Shadow depth of the Paper component. The higher the number, the further away the Paper appears to be from its background.',
            defaultValue: 1,
        },
        variant: {
            control: { type: 'radio' },
            options: ['elevation', 'outlined'],
            description: 'The variant of the Paper component',
        },
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PaperComponent: Story = {
    args: {
        elevation: 3,
        variant: 'elevation',
    },
    render: (args) => (
        <Paper {...args} sx={{ padding: 2 }}>
            Paper component with elevation {args.elevation}
        </Paper>
    ),
};