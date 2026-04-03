export type MenuNode = {
  id: number;
  code: string;
  name: string;
  path: string | null;
  icon: string | null;
  sortOrder: number | null;
  children: MenuNode[];
};

