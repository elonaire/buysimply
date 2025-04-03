import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../logger';

export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export type AuthMetadata = {
  sub: string;
  role: Role;
};

export function checkRefreshTokenCookie(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies['refreshToken'];
    if (!token) {
      res.statusCode = 401;
      throw new Error('Unauthorized')
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function superAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.authMetadata) {
      next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.statusCode = 401;
      throw new Error('Unauthorized')
    };

    // verify a token symmetric
    verifyToken(token, process.env.SUPERADMIN_SECRET!, req, res, next);

  } catch (error) {
    next(error);
  }
}

export function admin(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.authMetadata) {
      next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.statusCode = 401;
      throw new Error('Unauthorized')
    };

    // verify a token symmetric
    verifyToken(token, process.env.ADMIN_SECRET!, req, res, next);

  } catch (error) {
    next(error);
  }
}

export function staff(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.authMetadata) {
      next();
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.statusCode = 401;
      throw new Error('Unauthorized')
    };

    // verify a token symmetric
    verifyToken(token, process.env.STAFF_SECRET!, req, res, next);

  } catch (error) {
    next(error);
  }
}

function verifyToken(token: string, roleSecretKey: string, req: Request, res: Response, next: NextFunction) {
  jwt.verify(token, roleSecretKey, function (err, decoded: any) {

    if (err) {
      logger.error(err.message);
    }

    if (decoded) {
      let authMetaData: AuthMetadata = {
        sub: decoded.sub,
        role: decoded.role
      };
      req.authMetadata = authMetaData;

    }

    next();
  });
}
