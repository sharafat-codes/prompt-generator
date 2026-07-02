// Plain serializable view-types shared between the data layer (server) and
// components (server + client). Kept free of Prisma imports so client bundles
// never pull in the DB client.

export type VariableSpec = {
  key: string;
  label: string;
  type: "text" | "longtext" | "select";
  options?: string[];
  placeholder?: string;
};

export type PromptListItem = {
  id: string;
  slug: string;
  title: string;
  template: string;
  variableCount: number;
  runCount: number;
  starred: boolean;
};

export type PromptDetail = {
  id: string;
  slug: string;
  title: string;
  template: string;
  variables: VariableSpec[];
  versionNumber: number;
  runCount: number;
  starred: boolean;
  visibility: "PRIVATE" | "PUBLIC";
  publicSlug: string | null;
};

export type PublicPromptView = {
  title: string;
  template: string;
  variables: VariableSpec[];
  publicSlug: string;
};

export type PromptVersionItem = {
  id: string;
  versionNumber: number;
  createdAt: string; // ISO
  isCurrent: boolean;
};
