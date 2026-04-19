export type MenuNode = {
  id: number;
  parentId?: number | null;
  code: string;
  name: string;
  nameEn?: string | null;
  path: string | null;
  icon: string | null;
  sortOrder: number | null;
  isActive?: "Y" | "N";
  adminOnly?: "Y" | "N";
  children: MenuNode[];
};
