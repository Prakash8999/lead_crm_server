import { env } from "../../config/env";

const validateJwtSecret = (): string => {
    const secret = env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    if (secret.length < 32) {
        console.warn("JWT_SECRET should be at least 32 characters long for security");
    }
    return secret;
};



