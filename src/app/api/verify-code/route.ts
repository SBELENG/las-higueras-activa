import { NextRequest, NextResponse } from 'next/server';
import { getCodeStore } from '../_shared/codeStore';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Teléfono y código son requeridos' },
        { status: 400 }
      );
    }

    const store = getCodeStore();
    const stored = store.get(phone);

    if (!stored) {
      return NextResponse.json(
        { error: 'No se encontró un código para este número. Solicitá uno nuevo.' },
        { status: 404 }
      );
    }

    // Check expiry
    if (stored.expiresAt < Date.now()) {
      store.delete(phone);
      return NextResponse.json(
        { error: 'El código ha expirado. Solicitá uno nuevo.' },
        { status: 410 }
      );
    }

    // Check max attempts (brute-force protection)
    if (stored.attempts >= 5) {
      store.delete(phone);
      return NextResponse.json(
        { error: 'Demasiados intentos. Solicitá un nuevo código.' },
        { status: 429 }
      );
    }

    // Increment attempts
    stored.attempts += 1;

    // Verify code
    if (stored.code !== code.trim()) {
      const remaining = 5 - stored.attempts;
      return NextResponse.json(
        { 
          error: `Código incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''}.` : 'Sin intentos restantes.'}`,
          attemptsRemaining: remaining 
        },
        { status: 401 }
      );
    }

    // Code is correct - clean up
    store.delete(phone);

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Teléfono verificado correctamente',
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Error al verificar el código' },
      { status: 500 }
    );
  }
}
