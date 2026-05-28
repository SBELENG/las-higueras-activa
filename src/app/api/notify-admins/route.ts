import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Lazy-load firebase-admin to avoid build-time initialization
    const { adminMessaging, adminDb } = await import('@/lib/firebase-admin');

    const body = await request.json();
    const { claimId, category } = body;

    // Obtener todos los tokens de administradores registrados
    const tokensSnapshot = await adminDb.collection('adminTokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('No hay administradores registrados para recibir notificaciones.');
      return NextResponse.json({ success: true, message: 'No admins registered' }, { status: 200 });
    }

    const tokens: string[] = [];
    tokensSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: 'No valid tokens found' }, { status: 200 });
    }

    // Configurar el mensaje Push
    const message = {
      data: {
        title: '¡Nuevo Reclamo Recibido!',
        body: `Se ha registrado un nuevo reclamo en la categoría: ${category || 'General'}`,
        link: '/admin',
      },
      tokens: tokens,
    };

    // Enviar a todos los tokens a la vez (Multicast)
    const response = await adminMessaging.sendEachForMulticast(message);
    console.log(`✅ Notificación enviada a ${response.successCount} administradores.`);

    // Limpiar tokens inválidos o expirados (e.g., si el admin borró la app)
    const invalidTokens: string[] = [];
    response.responses.forEach((res: any, idx: number) => {
      if (!res.success && res.error) {
        if (
          res.error.code === 'messaging/invalid-registration-token' ||
          res.error.code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      console.log(`Eliminando ${invalidTokens.length} tokens inválidos...`);
      const batch = adminDb.batch();
      tokensSnapshot.forEach(doc => {
        if (invalidTokens.includes(doc.data().token)) {
          batch.delete(doc.ref);
        }
      });
      await batch.commit();
    }

    return NextResponse.json({ success: true, sentCount: response.successCount });
  } catch (error: any) {
    console.error('❌ Error enviando notificaciones a administradores:', error);
    return NextResponse.json(
      { error: 'Failed to notify admins', details: error.message },
      { status: 500 }
    );
  }
}
