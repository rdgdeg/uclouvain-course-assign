import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    width?: number;
    render?: (item: T, index: number) => React.ReactNode;
  }>;
  height?: number;
  rowHeight?: number;
  className?: string;
}

export function VirtualizedTable<T extends { id?: string | number }>({
  data,
  columns,
  height = 600,
  rowHeight = 50,
  className = '',
}: VirtualizedTableProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div style={style}>
        <TableRow className="hover:bg-muted/50">
          {columns.map((col) => (
            <TableCell key={col.key} style={col.width ? { width: col.width } : undefined}>
              {col.render ? col.render(item, index) : (item as any)[col.key]}
            </TableCell>
          ))}
        </TableRow>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className={className}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} style={col.width ? { width: col.width } : undefined}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="text-center py-8 text-muted-foreground">
          Aucune donnée à afficher
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      <div style={{ height, overflow: 'auto' }}>
        <List
          height={height}
          itemCount={data.length}
          itemSize={rowHeight}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
