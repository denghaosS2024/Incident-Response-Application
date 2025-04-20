import { Meta, StoryObj } from "@storybook/react";
import InventoryList from "../components/inventory/InventoryList";

const meta: Meta<typeof InventoryList> = {
  title: "Inventory/InventoryList",
  component: InventoryList,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

const inveItems = {
  category: "default",
  items: [
    { name: "Medical Kit", quantity: 10 },
    { name: "Repair Tools", quantity: 5 },
    {
      name: "Emergency",
      description: "Emergency response equipment",
      quantity: 22,
    },
  ],
};

export const Default: Story = {
  args: {
    items: inveItems.items,
    loading: false,
    onClick: (item) => {
      console.log("Clicked item:", item);
    },
  },
};

