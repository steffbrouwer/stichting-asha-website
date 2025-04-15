// lib/types.ts
import { DefaultSession } from "next-auth";

// Event interface
export interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: string; // Format: "YYYY-MM-DD"
  time: string;
  location: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

// Project interface
export interface Project {
  _id?: string;
  title: string;
  description: string;
  longDescription?: string;
  image?: string;
  document?: string;
  projectDate: string;
  author: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Uitbreiden van NextAuth Session type om de rol toe te voegen
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    role?: string;
  }
}

// Andere project-specifieke types kunnen hier worden toegevoegd