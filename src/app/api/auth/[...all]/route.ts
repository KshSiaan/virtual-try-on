<<<<<<< HEAD
import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
=======
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export const { GET, POST, PUT, PATCH, DELETE } = toNextJsHandler(auth);
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
