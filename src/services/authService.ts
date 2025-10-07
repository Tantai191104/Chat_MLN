import axiosClient from "@/app/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export async function login(email: string, password: string) {
  try {
    const res = await axiosClient.post("/account/login", { email, password });
    console.log("Login response:", res.data);

    // ✅ Ở đây backend trả về { message, data }
    const userData = res.data?.data;

    if (!userData) {
      throw new Error("Invalid login response format");
    }

    if (userData.token) {
      const store = useAuthStore.getState();
      store.setUser({
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        avatar: userData.avatar || "",
      });
      store.setAccessToken(userData.token);
    }

    return res.data; // Trả về { message, data }
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Login failed" };
  }
}

export async function register(name: string, email: string, password: string) {
  const res = await axiosClient.post("/account/register", {
    name,
    email,
    password,
  });
  console.log("Register response:", res);
  return res;
}

export const verifyOTP = async (email: string, otp: string) => {
  const res = await axiosClient.post("/account/verifyOTP", {
    email,
    otp,
    type: "verify_email",
  });
  return res;
};
export const resendOTP = async (email: string) => {
  const res = await axiosClient.post("/account/resendOTPtoEmail", {
    email,
    type: "verify_email",
  });
  return res;
};
export const sendOTPForgotPassword = async (email: string) => {
  const res = await axiosClient.post("/account/otp-reset-pass", { email });
  return res;
};
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const res = await axiosClient.post("/account/resetPassword", {
    email,
    otp,
    newPassword,
  });
  return res;
};
export const logout = async () => {
  const store = useAuthStore.getState();
  store.setUser(null);
  store.setAccessToken(null);
};
export const uploadAvatar = async (avatarUrl: File) => {
  const formData = new FormData();
  formData.append("avatar", avatarUrl);
  const res = await axiosClient.post(`/account/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};
export const changePassword = async (
  accountId: string,
  currentPass: string,
  newPass: string
) => {
  const res = await axiosClient.put(`/account/change-password/${accountId}`, {
    currentPass,
    newPass,
  });
  return res;
};
export const updateName = async (accountId: string, name: string) => {
  const res = await axiosClient.put(`/account/update/${accountId}`, {
    name,
  });
  return res;
};
