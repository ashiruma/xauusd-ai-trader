'use client';

import React from 'react';

interface CourseProgressGateProps {
  lessonNum: number;
  children: React.ReactNode;
}

export default function CourseProgressGate({ children }: CourseProgressGateProps) {
  return <>{children}</>;
}
