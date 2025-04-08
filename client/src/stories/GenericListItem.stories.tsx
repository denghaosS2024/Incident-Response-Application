import { NavigateNext as Arrow } from "@mui/icons-material";
import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import ItemList, { ItemListProps } from "../components/GenericListItem";

// Define the Contact interface with four fields.
interface Contact {
  _id: string;
  username: string;
  online: boolean;
  role: string;
}

// Define another model, e.g. Product.
interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

// Define meta without specifying a generic so that it doesn't force a particular type.
const meta: Meta = {
  title: "Components/GenericItemList",
  component: ItemList,
  tags: ["autodocs"],
};

export default meta;

interface SimpleItem {
  name: string;
}

export const Default: StoryObj<ItemListProps<SimpleItem>> = {
  args: {
    items: [{ name: "Alice" }, { name: "Bob" }],
    loading: false,
    getKey: (item: SimpleItem) => item.name,
    renderItem: (item: SimpleItem) => (
      <ListItem button>
        <ListItemText primary={item.name} />
        <ListItemSecondaryAction>
          <IconButton edge="end" size="large" onClick={action("chat with")}>
            <Arrow />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ),
  },
  render: (args) => <ItemList<SimpleItem> {...args} />,
};

// Story for Contacts with explicit type.
export const Contacts: StoryObj<ItemListProps<Contact>> = {
  args: {
    items: [
      { _id: "id-A", username: "UserA", online: true, role: "Admin" },
      { _id: "id-B", username: "UserB", online: false, role: "User" },
    ],
    loading: false,
    getKey: (item: Contact) => item._id,
    renderItem: (item: Contact) => (
      <ListItem button>
        <ListItemText
          primary={item.username}
          secondary={`Role: ${item.role}`}
        />
        <ListItemSecondaryAction>
          <Typography
            variant="caption"
            color={item.online ? "primary" : "textSecondary"}
            style={{ marginRight: 8 }}
          >
            {item.online ? "Online" : "Offline"}
          </Typography>
          <IconButton edge="end" size="large" onClick={action("chat with")}>
            <Arrow />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ),
  },
  render: (args) => <ItemList<Contact> {...args} />,
};

// Story for Products with explicit type.
export const Products: StoryObj<ItemListProps<Product>> = {
  args: {
    items: [
      { id: "p-1", name: "Product 1", price: 9.99, inStock: true },
      { id: "p-2", name: "Product 2", price: 19.99, inStock: false },
    ],
    loading: false,
    getKey: (item: Product) => item.id,
    renderItem: (item: Product) => (
      <ListItem button>
        <ListItemText
          primary={item.name}
          secondary={`Price: $${item.price} - ${
            item.inStock ? "In Stock" : "Out of Stock"
          }`}
        />
        <IconButton edge="end" size="large" onClick={action("product click")}>
          <Arrow />
        </IconButton>
      </ListItem>
    ),
  },
  render: (args) => <ItemList<Product> {...args} />,
};

export const Loading: StoryObj<ItemListProps<unknown>> = {
  args: {
    loading: true,
  },
};
