import { NextFunction, Request, Response } from 'express';
import loansJson from '../data/loans.json';
import { AuthMetadata, Role } from '../middleware/auth';

type Applicant = {
  name: string;
  email: string;
  telephone: string;
  totalLoan?: string;
};

type Loan = {
  id: string;
  amount: string;
  maturityDate: string;
  status: string;
  applicant: Applicant;
  createdAt: string;
};

type LoanQueryParams = {
  status?: string;
};

const loansData: Loan[] = loansJson;

export function getLoans(req: Request, res: Response, next: NextFunction) {
  try {
    let query = req.query as LoanQueryParams;

    let loans = loansData;

    if (req.authMetadata?.role === Role.STAFF) {
      // filter out totalLoan field
      loans.forEach((loan) => {
        delete loan.applicant.totalLoan;
      });
    }

    if (query.status) {
      loans = loans.filter((loan) => query.status?.includes(loan.status));
    }
    res.json({ loans });
  } catch (error) {
    next(error);
  }
}

export function getLoansByUserEmail(req: Request, res: Response, next: NextFunction) {
  let userEmail = req.params["userEmail"];

  let userLoans = loansData.filter((loan) => loan.applicant.email === userEmail);

  res.json({
    loans: userLoans
  })
}

export function getExpiredLoans(req: Request, res: Response, next: NextFunction) {
  let expiredLoans = loansData.filter((loan) => new Date(loan.maturityDate) < new Date());

  res.json({
    loans: expiredLoans
  })
}

export function deleteLoan(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.authMetadata?.role !== Role.SUPERADMIN) {
      throw new Error("Unauthorized");
    }

    let loanId = req.params["loanId"];

    let loanIndex = loansData.findIndex((loan) => loan.id === loanId);

    if (loanIndex === -1) {
      throw new Error("Loan not found");
    }

    loansData.splice(loanIndex, 1);

    res.json({
      message: "Loan deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}
