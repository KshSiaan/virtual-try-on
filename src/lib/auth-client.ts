import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";
import { ac, admin, manager, user } from "./auth/permissions";
export const authClient = createAuthClient({   
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    plugins:[
        adminClient({
            ac,
            roles: {
                user,
                admin,
                manager,
            },
        }),
        inferAdditionalFields<typeof auth>(),
    ]
})
