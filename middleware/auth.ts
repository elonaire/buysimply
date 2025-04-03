import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
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
    const token = req.cookies.refreshToken;

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
  try {
    let decoded = jwt.verify(token, roleSecretKey) as JwtPayload;

    if (decoded) {
      let authMetaData: AuthMetadata = {
        sub: decoded.sub!,
        role: decoded.role
      };
      req.authMetadata = authMetaData;
      next();
    }
  } catch (error) {
    // logger.error(error.message);
    next();
  }
}

export function postVerification(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.authMetadata) {
      next();
    } else {
      const token = req.cookies.refreshToken;
      const superAdminSecret = process.env.SUPERADMIN_SECRET!;
      const adminSecret = process.env.ADMIN_SECRET!;
      const staffSecret = process.env.STAFF_SECRET!;
      let secretKeys = [superAdminSecret, adminSecret, staffSecret];
      let secretKeyIndex = 0;

      let decoded: any;

      while (!decoded) {
        try {
          decoded = jwt.verify(token, secretKeys[secretKeyIndex]);
          console.log("decoded: ", decoded);

          let accessToken = jwt.sign({ sub: decoded.sub, role: decoded.role }, secretKeys[secretKeyIndex], { expiresIn: '5min' });

          let authMetaData: AuthMetadata = {
            sub: decoded.sub,
            role: decoded.role
          };
          req.authMetadata = authMetaData;

          res.setHeader('newAccessToken', accessToken);
          next();
        } catch (error) {
          decoded = null;
          secretKeyIndex += 1;
        }
      }

      if (!req.authMetadata) {
        throw new Error('Unauthorized');
      }
    }

  } catch (error) {
    next(error);
  }
}
