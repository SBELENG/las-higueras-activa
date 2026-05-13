import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');
  
  try {
    const { adminDb } = await import('@/lib/firebase-admin');

    // 1. Check all users
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      phone: doc.data().phone,
      hasFcmToken: !!doc.data().fcmToken,
      tokenPreview: doc.data().fcmToken ? doc.data().fcmToken.substring(0, 20) + '...' : 'NO TOKEN',
      name: doc.data().name || 'N/A',
    }));

    // 2. If phone provided, check specific user
    let specificUser = null;
    if (phone) {
      const q = await adminDb.collection('users').where('phone', '==', phone).get();
      if (!q.empty) {
        const data = q.docs[0].data();
        specificUser = {
          id: q.docs[0].id,
          phone: data.phone,
          name: data.name,
          hasFcmToken: !!data.fcmToken,
          tokenLength: data.fcmToken?.length || 0,
        };
      } else {
        specificUser = { error: `No user found with phone: ${phone}` };
      }
    }

    // 3. Check claims to see what phone format they use
    const claimsSnapshot = await adminDb.collection('claims').limit(5).get();
    const claimPhones = claimsSnapshot.docs.map(doc => ({
      claimId: doc.id,
      user_phone: doc.data().user_phone,
    }));

    return NextResponse.json({
      status: 'OK',
      totalUsers: users.length,
      users,
      specificUser,
      claimPhones,
      envCheck: {
        hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.message,
      code: error.code,
    }, { status: 500 });
  }
}
