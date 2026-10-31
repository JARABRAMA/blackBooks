export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  surnames: string;
  email: string;
  role: UserRole;
  image?: string | null;
  dni?: string;
  phoneNumber?: string;
};

export type BookCopyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "LOANED"
  | "DAMAGED"
  | "LOST"
  | "MAINTENANCE";

export type BookCopy = {
  id: string;
  bookId: string;
  code: string;
  status: BookCopyStatus;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string | null;
  description?: string | null;
  coverImage?: string | null;
  copies: BookCopy[];
};

export type ReservationStatus = "PENDING" | "FULFILLED" | "CANCELLED" | "EXPIRED";

export type Reservation = {
  id: string;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt?: string | null;
  user?: {
    id: string;
    name: string;
    surnames: string;
    email: string;
  };
  copy: {
    id: string;
    code: string;
    book: {
      id: string;
      title: string;
      author: string;
      category: string;
    };
  };
};

export type LoanStatus = "ACTIVE" | "RETURNED" | "OVERDUE";

export type Loan = {
  id: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: LoanStatus;
  user?: {
    id: string;
    name: string;
    surnames: string;
    email: string;
  };
  copy: {
    id: string;
    code: string;
    book: {
      id: string;
      title: string;
      author: string;
      category: string;
    };
  };
};

export type TransactionType = "RESERVATION" | "LOAN" | "RETURN";

export type Transaction = {
  id: string;
  type: TransactionType;
  notes?: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    surnames: string;
    email: string;
  };
  loan?: {
    id: string;
    user: {
      id: string;
      name: string;
      surnames: string;
      email: string;
    };
    copy: {
      id: string;
      code: string;
      book: {
        id: string;
        title: string;
        author: string;
      };
    };
  } | null;
};

export type AdminUser = {
  id: string;
  name: string;
  surnames: string;
  email: string;
  role: UserRole;
  createdAt: string;
  dni: string;
};
