import { AuthUser } from "../auth.types";

declare global {
    namespace Express {
        interface Request {
            user: AuthUser;
            // Set by validateQuery() middleware — typed output of the route's query schema.
            // Use this instead of req.query to avoid double-casting (as unknown as T).
            parsedQuery: Record<string, any>;
        }
    }
}
