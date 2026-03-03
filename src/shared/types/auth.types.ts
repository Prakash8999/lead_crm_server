export interface AuthUser {
    session_id: number;
    user_id: number;
    company_id: number;
    is_company_admin: boolean;
    expires_at: Date;
}