export default interface IInventory {
  category: string; // Category of the item (e.g., 'clothing', 'accessories')
  items: IInventoryItem[]; // Array of inventory items
}
export interface IInventoryItem {
  name: string; // Name of the item
  quantity: number; // Quantity of the item
  description?: string; // Optional description of the item
}
