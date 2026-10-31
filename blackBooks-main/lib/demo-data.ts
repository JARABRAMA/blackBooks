import type {
  AdminUser,
  Book,
  Loan,
  Reservation,
  Transaction,
} from "@/lib/types";

export const demoBooks: Book[] = [
  {
    id: "book-1",
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    category: "Novela",
    isbn: "9780307474728",
    copies: [
      { id: "c1", bookId: "book-1", code: "NOV-001", status: "AVAILABLE" },
      { id: "c2", bookId: "book-1", code: "NOV-002", status: "LOANED" },
      { id: "c3", bookId: "book-1", code: "NOV-003", status: "AVAILABLE" },
    ],
  },
  {
    id: "book-2",
    title: "El principito",
    author: "Antoine de Saint-Exupéry",
    category: "Infantil",
    isbn: "9780156013987",
    copies: [
      { id: "c4", bookId: "book-2", code: "INF-001", status: "RESERVED" },
      { id: "c5", bookId: "book-2", code: "INF-002", status: "AVAILABLE" },
    ],
  },
  {
    id: "book-3",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Tecnología",
    isbn: "9780132350884",
    copies: [
      { id: "c6", bookId: "book-3", code: "TEC-001", status: "LOANED" },
      { id: "c7", bookId: "book-3", code: "TEC-002", status: "AVAILABLE" },
      { id: "c8", bookId: "book-3", code: "TEC-003", status: "MAINTENANCE" },
    ],
  },
  {
    id: "book-4",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "Historia",
    isbn: "9780062316097",
    copies: [
      { id: "c9", bookId: "book-4", code: "HIS-001", status: "AVAILABLE" },
    ],
  },
];

export const demoReservations: Reservation[] = [
  {
    id: "res-1",
    status: "PENDING",
    reservedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
    user: {
      id: "u-lector",
      name: "Luis",
      surnames: "Lector",
      email: "lector@demo.local",
    },
    copy: {
      id: "c4",
      code: "INF-001",
      book: {
        id: "book-2",
        title: "El principito",
        author: "Antoine de Saint-Exupéry",
        category: "Infantil",
      },
    },
  },
];

export const demoLoans: Loan[] = [
  {
    id: "loan-1",
    loanDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null,
    status: "ACTIVE",
    user: {
      id: "u-lector",
      name: "Luis",
      surnames: "Lector",
      email: "lector@demo.local",
    },
    copy: {
      id: "c2",
      code: "NOV-002",
      book: {
        id: "book-1",
        title: "Cien años de soledad",
        author: "Gabriel García Márquez",
        category: "Novela",
      },
    },
  },
  {
    id: "loan-2",
    loanDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: null,
    status: "OVERDUE",
    user: {
      id: "u-lector",
      name: "Luis",
      surnames: "Lector",
      email: "lector@demo.local",
    },
    copy: {
      id: "c6",
      code: "TEC-001",
      book: {
        id: "book-3",
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Tecnología",
      },
    },
  },
  {
    id: "loan-3",
    loanDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    returnDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "RETURNED",
    user: {
      id: "u-lector",
      name: "Luis",
      surnames: "Lector",
      email: "lector@demo.local",
    },
    copy: {
      id: "c9",
      code: "HIS-001",
      book: {
        id: "book-4",
        title: "Sapiens",
        author: "Yuval Noah Harari",
        category: "Historia",
      },
    },
  },
];

export const demoUsers: AdminUser[] = [
  {
    id: "u-admin",
    name: "Ana",
    surnames: "Bibliotecaria",
    email: "admin@demo.local",
    role: "ADMIN",
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    dni: "12345678A",
  },
  {
    id: "u-lector",
    name: "Luis",
    surnames: "Lector",
    email: "lector@demo.local",
    role: "USER",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dni: "87654321B",
  },
];

export const demoTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "LOAN",
    notes: "Préstamo registrado",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    actor: demoUsers[0],
    loan: {
      id: "loan-1",
      user: demoUsers[1],
      copy: {
        id: "c2",
        code: "NOV-002",
        book: {
          id: "book-1",
          title: "Cien años de soledad",
          author: "Gabriel García Márquez",
        },
      },
    },
  },
  {
    id: "tx-2",
    type: "RETURN",
    notes: "Devolución a tiempo",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    actor: demoUsers[0],
    loan: {
      id: "loan-3",
      user: demoUsers[1],
      copy: {
        id: "c9",
        code: "HIS-001",
        book: {
          id: "book-4",
          title: "Sapiens",
          author: "Yuval Noah Harari",
        },
      },
    },
  },
  {
    id: "tx-3",
    type: "RESERVATION",
    notes: "Reserva creada",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    actor: demoUsers[1],
    loan: null,
  },
];
