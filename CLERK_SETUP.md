# Clerk GitHub OAuth Integration Guide

This guide explains how to set up end-to-end GitHub OAuth authentication using Clerk for the Theme Your Code VS Code extension.

## 🎯 Features Implemented

- ✅ **GitHub OAuth Sign-in** via Clerk
- ✅ **User Profile Management** with GitHub data
- ✅ **Secure Token Storage** in VS Code extension
- ✅ **Session Management** with automatic refresh
- ✅ **User Preferences Sync** connected to authentication
- ✅ **External Link Handling** for privacy/terms
- ✅ **Real-time Auth State** across webview and extension

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VS Code       │    │   Your Clerk    │    │   GitHub        │
│   Extension     │◄──►│   Server        │◄──►│   OAuth         │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ AuthCtrl    │ │    │ │ Clerk API   │ │    │ │ OAuth App   │ │
│ │ UserPrefs   │ │    │ │ JWT Tokens  │ │    │ │ Permissions │ │
│ │ Encryption  │ │    │ │ User Mgmt   │ │    │ │ Profile     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                        ▲
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│ React Webview   │    │ External        │
│ with Clerk UI   │    │ Browser Auth    │
└─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

1. **Clerk Account**: Sign up at [clerk.com](https://clerk.com)
2. **GitHub OAuth App**: Create at [GitHub Developer Settings](https://github.com/settings/developers)
3. **Server Setup**: You'll need a server to handle Clerk webhooks and API calls

## 🚀 Setup Instructions

### Step 1: Create Clerk Application

1. **Sign up/Login** to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Create New Application**
   - Choose "React" as framework
   - Select "GitHub" as OAuth provider
3. **Configure GitHub OAuth**
   - Go to "Social Connections" → "GitHub"
   - Enable GitHub provider
   - Add required scopes: `user:email`, `read:user`

### Step 2: Configure GitHub OAuth App

1. Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. **Create New OAuth App**
   ```
   Application name: Theme Your Code Extension
   Homepage URL: https://your-app-domain.com
   Authorization callback URL: https://your-clerk-app.clerk.accounts.dev/v1/oauth_callback
   ```
3. **Copy Client ID and Secret** to Clerk dashboard

### Step 3: Update Extension Configuration

Update the server configuration in your extension:

```typescript
// src/extension/controller/auth.ts
private serverConfig: ServerConfig = {
  baseUrl: "https://your-api-domain.com",
  githubUrl: "https://github.com/your-org/theme-your-code-server",
  privacyPolicyUrl: "https://your-domain.com/privacy",
  termsOfServiceUrl: "https://your-domain.com/terms",
  clerkPublishableKey: "pk_live_YOUR_CLERK_PUBLISHABLE_KEY", // Replace with your key
  clerkSignInUrl: "https://your-clerk-app.clerk.accounts.dev/sign-in",
  clerkSignUpUrl: "https://your-clerk-app.clerk.accounts.dev/sign-up",
};
```

### Step 4: Set Up Your Server (Required)

You need a server to handle Clerk authentication. Here's a basic Express.js example:

```javascript
// server.js
const express = require("express");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Clerk
const clerk = require("@clerk/clerk-sdk-node")({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Check authentication completion endpoint
app.get("/auth/check-session", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await clerk.users.getUser(userId);

    // Map Clerk user to your AuthUser format
    const authUser = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      username: user.username,
      githubUsername: user.externalAccounts?.find(
        (acc) => acc.provider === "github"
      )?.username,
      isSignedIn: true,
      lastSignInAt: user.lastSignInAt?.toISOString(),
      createdAt: user.createdAt?.toISOString(),
    };

    const session = {
      id: req.auth.sessionId,
      userId: user.id,
      status: "active",
      lastActiveAt: new Date().toISOString(),
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    res.json({ success: true, user: authUser, session });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Invalidate session endpoint
app.post("/auth/invalidate", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    await clerk.sessions.revokeSession(req.auth.sessionId);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Auth server running on port 3000");
});
```

### Step 5: Environment Variables

Create a `.env` file for your server:

```env
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
PORT=3000
```

### Step 6: Deploy Your Server

Deploy your server to a platform like:

- **Vercel** (recommended for Next.js)
- **Railway** (simple deployment)
- **Heroku** (classic option)
- **AWS Lambda** (serverless)

## 🔐 Security Features

### Data Encryption

- **AES-256-CBC** encryption for local storage
- **Random IV** for each encryption operation
- **Secure key generation** using crypto.randomBytes

### VS Code Integration

- **GlobalState Storage** for secure local data
- **Session Validation** with expiration checks
- **External Browser** for OAuth flow (security best practice)

### Consent Management

- **Explicit User Consent** for all data operations
- **Granular Permissions** for sync, analytics, etc.
- **Revokable Consent** at any time

## 🎨 UI/UX Features

### Authentication UI

- **GitHub Profile Display** with avatar and username
- **Sign-in/Sign-out** buttons with loading states
- **Error Handling** with user-friendly messages

### User Settings Integration

- **Programming Language Preferences** linked to user account
- **Consent Management** with clear explanations
- **Privacy Information** with links to policies

## 🔄 Authentication Flow

1. **User Clicks "Sign In"** in VS Code extension
2. **Extension Opens Browser** to Clerk sign-in page
3. **User Authorizes GitHub** OAuth permissions
4. **Clerk Redirects** with authentication tokens
5. **Extension Polls Server** to check completion
6. **Server Validates** and returns user data
7. **Extension Stores** encrypted user session
8. **UI Updates** to show authenticated state

## 🛠️ Development & Testing

### Local Development

```bash
# Install dependencies
npm install

# Start development server (if using local Clerk setup)
npm run dev

# Build extension
npm run build
```

### Testing Authentication

1. **Set Test Mode** in Clerk dashboard
2. **Use Test Publishable Key** in development
3. **Test OAuth Flow** in VS Code extension
4. **Verify Data Sync** with preferences

## 🚨 Important Security Notes

### Production Checklist

- [ ] Use production Clerk keys (not test keys)
- [ ] Validate all JWT tokens on server
- [ ] Implement rate limiting on auth endpoints
- [ ] Use HTTPS for all communications
- [ ] Sanitize all user inputs
- [ ] Log authentication events
- [ ] Set up monitoring for failed auth attempts

### Privacy Compliance

- [ ] Update privacy policy with data collection details
- [ ] Implement data deletion on user request
- [ ] Provide data export functionality
- [ ] Comply with GDPR/CCPA requirements

## 🐛 Troubleshooting

### Common Issues

**"Clerk publishable key not available"**

- Ensure server configuration is properly set
- Check that the key starts with `pk_`

**"Authentication polling timeout"**

- Verify server endpoints are accessible
- Check CORS configuration
- Ensure Clerk webhook setup is correct

**"Session expired" errors**

- Implement session refresh logic
- Check session expiration times
- Verify token validation on server

### Debug Mode

Enable debug logging in the extension:

```typescript
// In extension controller
private debugMode = process.env.NODE_ENV === 'development';
if (this.debugMode) {
  console.log('Auth debug:', authData);
}
```

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [GitHub OAuth Apps Guide](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [React Clerk Components](https://clerk.com/docs/components/overview)

## 🤝 Support

For issues specific to this implementation:

1. Check the troubleshooting section above
2. Review server logs for authentication errors
3. Verify Clerk dashboard configuration
4. Test with Clerk's development tools

---

**Note**: This integration provides enterprise-grade authentication for your VS Code extension while maintaining user privacy and security best practices.
