import { Response } from "express";



// Response Types and Utilities
interface SuccessResponse<T> {
    status: "success";
    code: number;
    error: false;
    meta?: any;
    data: T | [];
    message: string;
    assetsBaseUrl?: string;
}

interface ErrorResponse {
    status: "failed";
    code: number;
    error: true;
    data?: any;
    message: string;
    validationErrors?: any[];
}

interface ValidationErrorResponse {
    code: 422;
    error: true;
    data: any[];
    message: "Validation errors";
}

// ✅ Success Response
const success = <T>(message: string, results: T, statusCode: number, meta?: any): SuccessResponse<T> => {
    return {
        status: "success",
        code: statusCode,
        error: false,
        meta,
        data: results || [],
        message,
    };
};

// ✅ Error Response
const error = (message: string, statusCode: number, err?: any): ErrorResponse => {
    const codes = [200, 201, 400, 401, 404, 403, 409, 422, 500];
    const findCode = codes.includes(statusCode) ? statusCode : 500;

    return {
        status: "failed",
        code: findCode,
        error: true,
        data: err || [],
        message,
    };
};

// ✅ Validation Response
const validation = (errors: any[]): ValidationErrorResponse => {
    return {
        code: 422,
        error: true,
        data: errors || [],
        message: "Validation errors",
    };
};





export const successHandler = <T>(
    res: Response,
    message: string,
    statusCode: number,
    results: T,
    meta?: any
) => {
    return res.status(statusCode).json(success<T>(message, results, statusCode, meta));
};

export const errorHandler = (res: Response, message: string, statusCode: number, err?: any, errors?: any[]) => {
    const errorResponse = error(message, statusCode, err);

    // Add validation errors if provided
    if (errors && errors.length > 0) {
        errorResponse.validationErrors = errors;
    }

    return res.status(statusCode).json(errorResponse);
};