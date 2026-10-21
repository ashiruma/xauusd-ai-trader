import React from 'react';
import Link from 'next/link';
export default function GatedAccessCard() {
  return <section><h2>Secure access is being prepared</h2>
    <p>No broker account number can unlock access. Sign-in, lesson delivery and trading remain disabled.</p>
    <Link href="/login">View connection requirements</Link></section>;
}
