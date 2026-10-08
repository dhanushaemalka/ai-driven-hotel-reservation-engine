import User from "../models/User.js";

//middleware to check if user is authenticated

const resolveClerkAuth = async (req) => {
  // Clerk currently exposes req.auth, but in newer versions it can be a function (deprecation warning).
  if (!req || !req.auth) return null;
  if (typeof req.auth === 'function') {
    try {
      return await req.auth();
    } catch {
      return null;
    }
  }
  return req.auth;
};

const getClerkUserId = async (req) => {
  const auth = await resolveClerkAuth(req);
  const clerkUserId = auth?.userId || auth?.sub || auth?.id || null;
  if (!clerkUserId) {
    const keys = auth ? Object.keys(auth) : [];
    console.log('[authMiddleware] Could not resolve clerk user id', { authType: typeof req.auth, keys });
  }
  return clerkUserId;
};

const getAuthMeta = async (req) => {
  const auth = await resolveClerkAuth(req);
  const claims = auth?.sessionClaims || auth?.claims || {};
  const candidates = [
    auth?.email,
    auth?.user?.email,
    auth?.user?.primaryEmailAddress,
    auth?.claims?.email,
    auth?.claims?.email_address,
    auth?.sessionClaims?.email,
    auth?.sessionClaims?.email_address,
    auth?.sessionClaims?.primary_email_address,
    claims?.email,
    claims?.email_address,
    claims?.primary_email_address,
  ].filter(Boolean);

  const email = candidates.length
    ? String(candidates[0]).trim().toLowerCase()
    : null;

  const usernameCandidates = [
    claims?.fullName,
    claims?.name,
    claims?.username,
    auth?.user?.username,
    auth?.user?.fullName,
    [claims?.first_name, claims?.last_name].filter(Boolean).join(' '),
  ].filter(Boolean);

  const username = usernameCandidates.length
    ? String(usernameCandidates[0]).trim()
    : 'User';

  const image =
    auth?.image ||
    claims?.picture ||
    auth?.user?.image ||
    auth?.user?.picture ||
    "https://via.placeholder.com/120";

  return { email, username, image };
};

export const protect = async (req,res,next) => {
   const userId = await getClerkUserId(req);
   if(!userId){
    return res.json({ success: false, message: "not authenticated" })
   }

   let user = await User.findById(userId);
   if (!user) {
    const { email, username, image } = await getAuthMeta(req);
    console.log('[authMiddleware] user not found for clerk userId', { userId, email });

    if (email) {
      // Preserve existing role (especially admin) if the same email already exists under another _id.
      const existingByEmail = await User.findOne({ email: email.toLowerCase().trim() });
      const role = existingByEmail?.role || 'guest';
      const loyaltyStatus = existingByEmail?.loyaltyStatus || 'standard';
      const isActive = existingByEmail?.isActive ?? true;

      user = await User.findByIdAndUpdate(
        userId,
        {
          _id: userId,
          email: email.toLowerCase().trim(),
          username: username || 'User',
          image: image || "https://via.placeholder.com/120",
          role,
          loyaltyStatus,
          isActive,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
   }

   // If we still couldn't resolve a Mongo user, fail authentication (prevents misleading admin checks).
   if (!user) {
    return res.json({ success: false, message: "not authenticated" });
   }

   req.user = user;
   next();
}

// Optional auth middleware - doesn't block if not authenticated, but sets req.user if available
export const optionalAuth = async (req, res, next) => {
  try {
    let userId = null;
    
    // Try to get userId from Clerk auth
    if (req.auth) {
      userId = await getClerkUserId(req);
      try {
        const user = await User.findById(userId);
        req.user = user;
      } catch (err) {
        console.log('Could not find user in DB:', userId);
        // User not found, use demo
        req.user = {
          _id: 'demo-user-' + Date.now(),
          email: 'demo@example.com',
          role: 'guest'
        };
      }
    } else {
      // No authentication, use demo mode
      console.log('No auth provided, using demo user');
      req.user = {
        _id: 'demo-user-' + Date.now(),
        email: 'demo@example.com',
        role: 'guest'
      };
    }
  } catch (error) {
    console.log('Error in optionalAuth:', error.message);
    // If anything fails, allow demo mode
    req.user = {
      _id: 'demo-user-' + Date.now(),
      email: 'demo@example.com',
      role: 'guest'
    };
  }
  next();
};


