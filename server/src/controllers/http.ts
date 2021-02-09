import { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { generateId, sessionCreate } from "../models/sessions";

const create = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = await generateId();
    const redisRes = await sessionCreate(sessionId);

    if (redisRes) {
        console.info(`new session ${sessionId} created`)
        return res.status(StatusCodes.OK).json({ sessionId });
    } else {
        console.error(`failed to create new session`)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

const router = Router();
router.post('/session', create);

export default router