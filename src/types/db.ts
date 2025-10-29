export type ThemeSchema = {
  id: number;
  userId: string;
  name: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  headVersionId: number | null;
};
export type ThemeVersionSchema = {
  id: number;
  themeId: number;
  hash: string;
  parentId: number | null;
  filePath: string;
  createdAt: string;
};
type DeviceLogin = {
  id: number;
  device_code: string;
  user_code: string;
  session_id: string | null;
  user_id: number | null;
  approved: boolean | null;
  revoked: boolean | null;
  machineId: string | null;
  appName: string | null;
  device_name: string | null;
  os: string | null;
  extension_version: string | null;
  ip_address: string | null;
  created_at: string | null;
  expires_at: string;
  updated_at: string | null;
};
type User = {
  id: number;
  name: string;
  email: string;
  profileImage: string | null;
  clerkId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
