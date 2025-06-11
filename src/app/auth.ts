import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/auth";

export const auth = () => getServerSession(authOptions);