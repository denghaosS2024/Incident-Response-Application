import MedicationForm from '../components/MedicationForm';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/MedicationForm',
  component: MedicationForm,
};

export const Default = () => (
  <MedicationForm
    onSave={action('Save clicked')}
  />
);

export const WithData = () => (
  <MedicationForm
    data={{
      name: 'Paracetamol',
      frequency: 'Twice a day',
      time: 'Morning and Evening',
      route: 'oral',
      notes: 'Take after meals',
    }}
    onSave={action('Save clicked')}
  />
);

export const ReadOnly = () => (
  <MedicationForm
    readOnly
    data={{
      name: 'Ibuprofen',
      frequency: 'Once a day',
      time: 'Night',
      route: 'topical',
      notes: 'Apply on affected area only.',
    }}
  />
);
