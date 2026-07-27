import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as AdminPlugin } from "better-auth/plugins/admin";
import { db } from "./db"; // your drizzle instance
import { ac, admin, manager, user } from "./auth/permissions";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
<<<<<<< HEAD
    trustedOrigins: ["http://localhost:3000"],
    emailAndPassword: {
        enabled: true,
    },
=======
    emailAndPassword: {
        enabled: true,
        requireEmailVerification:false,
    },
    
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
    plugins:[AdminPlugin({
        ac,
        defaultRole:"user",
        roles:{
            user,
            admin,
            manager
        }
    })]
});