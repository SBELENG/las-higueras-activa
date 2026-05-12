import { NextRequest, NextResponse } from 'next/server';

// Force dynamic to prevent Next.js from trying to pre-render this route at build time
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Lazy-load firebase-admin to avoid build-time initialization
    const { adminMessaging, adminDb } = await import('@/lib/firebase-admin');

    const body = await request.json();
    const { userPhone, title, body: messageBody } = body;

    if (!userPhone || !title || !messageBody) {
      return NextResponse.json(
        { error: 'Missing required fields: userPhone, title, body' },
        { status: 400 }
      );
    }

    // 1. Look up the user's FCM token from Firestore
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('phone', '==', userPhone).get();

    if (snapshot.empty) {
      console.log(`No user found with phone: ${userPhone}`);
      return NextResponse.json(
        { success: false, reason: 'User not found in database' },
        { status: 200 }
      );
    }

    const userData = snapshot.docs[0].data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log(`User ${userPhone} has no FCM token (notifications not enabled)`);
      return NextResponse.json(
        { success: false, reason: 'User has no FCM token' },
        { status: 200 }
      );
    }

    // 2. Send the push notification via FCM
    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: messageBody,
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
        },
        fcmOptions: {
          link: '/mensajes',
        },
      },
    };

    const response = await adminMessaging.send(message);
    console.log(`✅ Push notification sent to ${userPhone}:`, response);

    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('❌ Error sending push notification:', error);

    // Handle invalid/expired tokens gracefully
    if (
      error.code === 'messaging/registration-token-not-registered' ||
      error.code === 'messaging/invalid-registration-token'
    ) {
      return NextResponse.json(
        { success: false, reason: 'Token expired or invalid' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}
