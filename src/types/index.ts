export interface AuthUser {
  userId: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "PRIMARY_ADMIN";
  hostelId: string;
}

export interface HostelInfo {
  id: string;
  name: string;
  code: string;
  description: string | null;
  wardenName: string;
  wardenEmail: string;
  wardenPhone: string;
  address: string | null;
  rules: string[];
  imageUrl: string | null;
  totalRooms: number;
  capacity: number;
}

export interface RoomInfo {
  id: string;
  number: string;
  floor: number;
  capacity: number;
  occupied: number;
  roomType: string;
  hostelId: string;
  occupants?: UserInfo[];
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  hostelId: string;
  roomId: string | null;
  bedNumber: number | null;
  profileImage: string | null;
  createdAt: string;
}

export interface LeaveRequestInfo {
  id: string;
  userId: string;
  reason: string;
  startDate: string;
  endDate: string;
  originalEnd: string | null;
  extensionReason: string | null;
  returnReason: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user?: UserInfo;
}

export interface NotificationInfo {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface ComplaintInfo {
  id: string;
  userId: string;
  hostelId: string;
  subject: string;
  description: string;
  category: string | null;
  priority: string;
  status: string;
  response: string | null;
  createdAt: string;
  user?: UserInfo;
}

export interface ApplicationInfo {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  aadharNumber: string | null;
  collegeIdUpload: string | null;
  hostelId: string;
  emailVerified: boolean;
  roommatePreference: string | null;
  createdAt: string;
  hostel?: HostelInfo;
}

export interface MessMenuInfo {
  id: string;
  hostelId: string;
  day: string;
  mealType: string;
  items: string[];
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedBeds: number;
  totalCapacity: number;
  activeLeaves: number;
  pendingApplications: number;
  pendingLeaves: number;
  openComplaints: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
