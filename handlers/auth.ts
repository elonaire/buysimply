import { NextFunction, Request, Response } from 'express';
import staffJson from '../data/staffs.json';
import jwt from 'jsonwebtoken';

type LoginRequestBody = {
  email: string;
  password: string;
};

type Staff = {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
};

const staffData = staffJson as Staff[];

export function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as LoginRequestBody;

    let staff = staffData.find((staff) => staff.email === email && staff.password === password);

    if (!staff) {
      res.statusCode = 401;
      throw new Error('Wrong email or password');
    }

    let roleUpperCase = staff.role.toUpperCase();
    let roleSecretKey = process.env[`${roleUpperCase}_SECRET`];

    if (!roleSecretKey) {
      throw new Error('Server Error');
    }

    let accessToken = jwt.sign({ sub: staff.id, }, roleSecretKey, { expiresIn: '5min' });
    let refreshToken = jwt.sign({ sub: staff.id, }, roleSecretKey, { expiresIn: '7d' });

    // set refresh token in cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    res.json({
      accessToken,
    } as LoginResponse);
  } catch (error) {
    next(error);
  }
};

export function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('refresh_token');
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};
