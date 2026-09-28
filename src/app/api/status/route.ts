import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    system: 'LabView UFPI - Sistema de Laboratórios',
    institution: 'Universidade Federal do Piauí (UFPI) - CSHNB Picos',
    authors: ['Luis G. L. D. Ramos', 'Marcos Eduardo', 'Veron'],
    timestamp: new Date().toISOString()
  });
}
