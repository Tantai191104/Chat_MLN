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
