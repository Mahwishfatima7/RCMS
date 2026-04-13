import { authService } from "./authService";

const BASE_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function getHeaders(includeAuth = true) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = authService.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function apiCall<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getHeaders(true),
        ...(options.headers as Record<string, string>),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data);
      return {
        success: false,
        error:
          data.error || data.message || `Request failed (${response.status})`,
      };
    }

    return { success: true, ...data };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "API request failed";
    console.error("API Error:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

// ============== COMPLAINTS ==============
export const complaintApi = {
  getAll: (filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) =>
    apiCall<any>("/complaints", {
      method: "GET",
    }),

  getById: (id: number | string) => apiCall<any>(`/complaints/${id}`),

  getByAgent: (agentId: number | string) =>
    apiCall<any>(`/complaints/agent/${agentId}`),

  create: (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    serialNo: string;
    deviceModel: string;
    issueDescription: string;
    purchaseDate?: string;
  }) =>
    apiCall<any>("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number | string, status: string) =>
    apiCall<any>(`/complaints/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  update: (id: number | string, data: Record<string, any>) =>
    apiCall<any>(`/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) =>
    apiCall<any>(`/complaints/${id}`, { method: "DELETE" }),
};

// ============== BOOKINGS ==============
export const bookingApi = {
  getAll: () => apiCall<any>("/manufacturer-updates"),

  getByComplaintId: (complaintId: number | string) =>
    apiCall<any>(`/manufacturer-updates/${complaintId}`),

  create: (data: {
    complaintId: number;
    bookingId: string;
    bookedDate: string;
    manufacturerStatus: string;
    referenceNo: string;
    notes?: string;
  }) =>
    apiCall<any>("/manufacturer-updates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number | string, data: Record<string, any>) =>
    apiCall<any>(`/manufacturer-updates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) =>
    apiCall<any>(`/manufacturer-updates/${id}`, { method: "DELETE" }),
};

// ============== SERIALS ==============
export const serialApi = {
  validate: (serialNo: string) =>
    apiCall<any>(`/serials/validate/${serialNo}`, { method: "GET" }),

  getAll: () => apiCall<any>("/serials"),

  getByNo: (serialNo: string) => apiCall<any>(`/serials/${serialNo}`),

  create: (data: {
    serialNo: string;
    purchaseDate: string;
    warrantyExpiry: string;
    model: string;
  }) =>
    apiCall<any>("/serials", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============== USERS ==============
export const userApi = {
  getAll: () => apiCall<any>("/users"),

  getById: (id: number | string) => apiCall<any>(`/users/${id}`),

  update: (id: number | string, data: Record<string, any>) =>
    apiCall<any>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number | string) =>
    apiCall<any>(`/users/${id}`, { method: "DELETE" }),
};

// ============== ANALYTICS ==============
export const analyticsApi = {
  getDashboard: () => apiCall<any>("/analytics/dashboard"),

  getReports: () => apiCall<any>("/analytics/reports"),
};
