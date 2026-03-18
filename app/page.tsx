import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      redirect('/dashboard');
    } catch {
      // Token is invalid or expired — fall through to login
      redirect('/login');
    }
  } else {
    redirect('/login');
  }
}

