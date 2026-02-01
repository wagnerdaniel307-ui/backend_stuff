import { z } from "zod";

export const walletValidation = {
  setPin: z.object({
    body: z.object({
      pin: z.string()
        .length(4, "PIN must be exactly 4 digits")
        .regex(/^[0-9]+$/, "PIN must only contain numbers")
    }),
  }),
  changePin: z.object({
    body: z.object({
      currentPin: z.string().min(1, "Current PIN is required"),
      newPin: z.string()
        .length(4, "New PIN must be exactly 4 digits")
        .regex(/^[0-9]+$/, "New PIN must only contain numbers")
    }),
  }),
};
