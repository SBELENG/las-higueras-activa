import { NextRequest, NextResponse } from 'next/server';
import { getCodeStore } from '../_shared/codeStore';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || phone.length < 8) {
      return NextResponse.json(
        { error: 'Número de teléfono inválido' },
        { status: 400 }
      );
    }

    const store = getCodeStore();

    // Rate limiting: max 1 code per 60 seconds per phone
    const existing = store.get(phone);
    if (existing && existing.expiresAt > Date.now() && (existing.expiresAt - Date.now()) > 4 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Ya se envió un código. Esperá 60 segundos antes de solicitar otro.' },
        { status: 429 }
      );
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 5-minute expiry
    store.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // Clean up expired codes
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (value.expiresAt < now) {
        store.delete(key);
      }
    }

    // ================================================
    // TODO: Integrar con servicio SMS real aquí
    // Ejemplo con Twilio:
    // await twilioClient.messages.create({
    //   body: `Tu código de verificación Las Higueras Activa: ${code}`,
    //   from: '+1234567890',
    //   to: `+54${phone}`,
    // });
    // ================================================

    // For development: log the code to the server console
    console.log(`📱 [DEV] Código de verificación para ${phone}: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Código enviado correctamente',
      // ONLY in development - remove in production!
      ...(process.env.NODE_ENV === 'development' ? { devCode: code } : {}),
    });
  } catch (error) {
    console.error('Error sending code:', error);
    return NextResponse.json(
      { error: 'Error al enviar el código' },
      { status: 500 }
    );
  }
}
