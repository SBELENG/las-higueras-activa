import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  setDoc,
  addDoc,
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export interface Claim {
  id?: string;
  user_phone: string;
  user_name: string;
  user_role: string;
  category: string;
  description: string;
  photo: string | null;
  address: string;
  location: { lat: number; lng: number };
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: boolean;
  date: any;
  last_observation?: string;
  rejection_reason?: string;
}

export interface Message {
  id?: string;
  user_phone: string;
  from: string;
  title: string;
  body: string;
  date: any;
  type: 'update' | 'alert' | 'info';
  read: boolean;
  claim_id?: string;
}

// ---------------------------------------------------------
// CLAIMS (Reclamos)
// ---------------------------------------------------------

/**
 * Creates a new claim. If a base64 photo is provided, it uploads it to Storage first.
 */
export async function createClaim(claimData: Omit<Claim, 'photo'> & { photoBase64: string | null }) {
  try {
    let photoUrl = null;

    // 1. Upload photo to Firebase Storage if exists
    if (claimData.photoBase64) {
      // Generate a unique filename
      const fileName = `reclamos/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, fileName);
      
      // Upload the base64 string
      await uploadString(storageRef, claimData.photoBase64, 'data_url');
      
      // Get the public URL
      photoUrl = await getDownloadURL(storageRef);
    }

    // 2. Generate auto-incrementing sequential ID (1, 2, 3...)
    const newIdStr = await runTransaction(db, async (transaction) => {
      const counterRef = doc(db, 'metadata', 'counters');
      const counterDoc = await transaction.get(counterRef);
      
      let nextId = 1;
      if (counterDoc.exists()) {
        nextId = (counterDoc.data().claim_count || 0) + 1;
        transaction.update(counterRef, { claim_count: nextId });
      } else {
        transaction.set(counterRef, { claim_count: 1 });
      }
      return nextId.toString(); // e.g., "1", "15"
    });

    // 3. Save claim document to Firestore using the numeric ID
    const newClaim = {
      ...claimData,
      photo: photoUrl,
      status: 'PENDING',
      priority: false,
      date: serverTimestamp(),
    };
    
    // Remove the base64 prop before saving
    delete (newClaim as any).photoBase64;

    await setDoc(doc(db, 'claims', newIdStr), newClaim);
    return newIdStr;
  } catch (error) {
    console.error("Error creating claim:", error);
    throw error;
  }
}

/**
 * Get all claims for the Admin dashboard
 */
export async function getAllClaims(): Promise<Claim[]> {
  const q = query(collection(db, 'claims'), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Claim));
}

/**
 * Get claims for a specific user (citizen)
 */
export async function getUserClaims(phone: string): Promise<Claim[]> {
  const q = query(collection(db, 'claims'), where('user_phone', '==', phone));
  const querySnapshot = await getDocs(q);
  
  // Need to sort in memory because Firestore requires a composite index for where + orderBy
  const claims = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Claim));
  
  return claims.sort((a, b) => {
    const timeA = a.date?.toMillis ? a.date.toMillis() : 0;
    const timeB = b.date?.toMillis ? b.date.toMillis() : 0;
    return timeB - timeA;
  });
}

/**
 * Update a claim's status (Admin only)
 */
export async function updateClaimStatus(claimId: string, newStatus: string, observation: string, reason?: string) {
  const claimRef = doc(db, 'claims', claimId);
  const updateData: any = {
    status: newStatus,
    last_observation: observation,
  };

  if (reason) {
    updateData.rejection_reason = reason;
  }

  await updateDoc(claimRef, updateData);
}

/**
 * Toggle claim priority (Admin only)
 */
export async function toggleClaimPriority(claimId: string, isPriority: boolean) {
  const claimRef = doc(db, 'claims', claimId);
  await updateDoc(claimRef, { priority: isPriority });
}

// ---------------------------------------------------------
// MESSAGES (Mensajes)
// ---------------------------------------------------------

/**
 * Send a message to a specific user
 */
export async function createMessage(message: Message) {
  const newMsg = {
    ...message,
    date: serverTimestamp()
  };
  await addDoc(collection(db, 'messages'), newMsg);
}

/**
 * Get messages for a specific user
 */
export async function getUserMessages(phone: string): Promise<Message[]> {
  const q = query(collection(db, 'messages'), where('user_phone', '==', phone));
  const querySnapshot = await getDocs(q);
  
  const messages = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Message));
  
  return messages.sort((a, b) => {
    const timeA = a.date?.toMillis ? a.date.toMillis() : 0;
    const timeB = b.date?.toMillis ? b.date.toMillis() : 0;
    return timeB - timeA;
  });
}

/**
 * Mark a message as read
 */
export async function markMessageRead(messageId: string) {
  const msgRef = doc(db, 'messages', messageId);
  await updateDoc(msgRef, { read: true });
}

/**
 * Real-time listener for unread messages count
 */
export function listenUnreadMessages(phone: string, callback: (count: number) => void) {
  const q = query(
    collection(db, 'messages'), 
    where('user_phone', '==', phone),
    where('read', '==', false)
  );
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.length);
  });
}

/**
 * Save or update FCM token for a user.
 * If user doesn't exist in Firestore, it's created.
 */
export async function saveFcmToken(phone: string, token: string | null, error?: string) {
  const q = query(collection(db, 'users'), where('phone', '==', phone));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    const updateData: any = {
      lastTokenUpdate: serverTimestamp()
    };
    if (token) updateData.fcmToken = token;
    if (error) updateData.fcmError = error;
    
    await updateDoc(doc(db, 'users', userDoc.id), updateData);
  } else {
    // If user somehow doesn't exist yet, create a placeholder
    const newData: any = {
      phone,
      lastTokenUpdate: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    if (token) newData.fcmToken = token;
    if (error) newData.fcmError = error;
    
    await addDoc(collection(db, 'users'), newData);
  }
}

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfile(userData: { name: string, phone: string, role: string }) {
  const q = query(collection(db, 'users'), where('phone', '==', userData.phone));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } else {
    await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp()
    });
  }
}
