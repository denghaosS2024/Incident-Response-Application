import { TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { ReactNode } from "react";
import Loading from "./common/Loading";

export interface ItemListProps<T> {
  items?: T[];
  loading: boolean;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

const ItemList = <T,>({
  items,
  loading,
  getKey,
  renderItem,
}: ItemListProps<T>) => {
  if (loading) return <Loading />;

  if (!items || items.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5}>
            <Typography style={{ padding: 16 }}>
              No Incidents available
            </Typography>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {items.map((item) => (
        <TableRow key={getKey(item)}>{renderItem(item)}</TableRow>
      ))}
    </TableBody>
  );
};

export default ItemList;
