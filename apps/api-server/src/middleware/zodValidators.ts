import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type SchemaType = z.ZodObject<any>;
declare global {
    namespace Express {
        interface Request {
            validatedData?: z.infer<SchemaType>;
        }
    }
}

export const validateProject = (schema: SchemaType) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = schema.parse(req.body);
        req.validatedData = validatedData;
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({ success: false, error: error.errors });
        } else {
            console.error("Error during validation:", error);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }
};
