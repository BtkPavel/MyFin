import { prisma } from "./prisma";

export async function getDefaultUserId(): Promise<string> {
  const user = await prisma.user.findFirst();
  if (!user) {
    const newUser = await prisma.user.create({
      data: { baseCurrency: "BYN" },
    });
    return newUser.id;
  }
  return user.id;
}
