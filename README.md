# Adil's Lites

A private dashboard web app for controlling LIFX smart lights with a modern, minimal interface.

## Features

- **Custom Authentication**: Simple email + password authentication using environment variables (no third-party auth)
- **LIFX Integration**: Control your LIFX lights (power, brightness, color) through a secure server-side proxy
- **Modern UI**: Built with TailwindCSS and shadcn/ui components
- **Smooth Animations**: Framer Motion animations for a polished experience
- **Real-time Updates**: Auto-refreshing light status every 5 seconds
- **Color Picker**: Intuitive hex color picker for setting light colors

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: TailwindCSS 4 + shadcn/ui
- **Animations**: Framer Motion
- **Data Fetching**: SWR for real-time updates
- **Color Picker**: react-colorful
- **Language**: TypeScript

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with your configuration:

```bash
# Copy the example file
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
AUTH_ALLOWED_EMAILS=your-email@example.com,friend@example.com
AUTH_SHARED_PASSWORD=your-secure-password
LIFX_API_TOKEN=your-lifx-api-token
LIFX_DEFAULT_SELECTOR=all
```

**Getting your LIFX API token:**
1. Go to https://cloud.lifx.com/settings
2. Generate a new personal access token
3. Copy the token to your `.env.local` file

### 3. Fix OneDrive Conflicts (Windows Only)

**IMPORTANT**: If your project is in a OneDrive folder, you need to handle file locking issues:

**Option A: Exclude .next from OneDrive (Recommended)**
1. Create a `.next` folder if it doesn't exist
2. Right-click the `.next` folder → "Free up space"
3. This tells OneDrive to not sync that folder

**Option B: Move Project (Alternative)**
Move the project to a non-OneDrive location like `C:\projects\adilslites`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Login

You'll be automatically redirected to `/login`. Sign in with one of the emails from `AUTH_ALLOWED_EMAILS` and the password from `AUTH_SHARED_PASSWORD`.

## Project Structure

```
adilslites/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Login endpoint
│   │   │   └── logout/route.ts      # Logout endpoint
│   │   └── lifx/
│   │       ├── lights/route.ts      # Fetch lights
│   │       └── state/route.ts       # Update light state
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Dashboard page
│   └── globals.css                  # Global styles
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── LightCard.tsx                # Individual light control
│   └── GlobalControls.tsx           # Control all lights
├── lib/
│   ├── auth.ts                      # Auth helper functions
│   ├── lifx.ts                      # LIFX helper functions
│   └── utils.ts                     # Utility functions
├── middleware.ts                    # Auth protection middleware
└── .env.example                     # Environment variables template
```

## Features Overview

### Authentication

- Custom middleware protects all routes except `/login`
- Email/password validation against environment variables
- Secure HTTP-only cookies for session management
- Automatic redirect on login/logout

### Dashboard

- **Top Bar**: Shows app name, logged-in email, and logout button
- **Global Controls**: 
  - Overall light status (X of Y lights online)
  - Toggle all lights on/off at once
  - Set color for all lights with a visual color picker
- **Individual Light Cards**:
  - Show light name, location/group, online status
  - Power toggle switch
  - Brightness slider (0-100%)
  - Color picker with hex input
  - Real-time status updates

### LIFX API Integration

All LIFX API calls are proxied through Next.js API routes to keep your token secure:

- `GET /api/lifx/lights` - Fetch list of lights
- `POST /api/lifx/state` - Update light state (power, brightness, color)

The LIFX API token never gets exposed to the client.

## Development Notes

### OneDrive Sync Issue

If you encounter build errors related to `.next` directory (common on Windows with OneDrive), you can:

1. Exclude `.next` folder from OneDrive sync:
   - Right-click `.next` folder → "Free up space"
   
2. Or move the project outside of OneDrive-synced folders

The dev server (`npm run dev`) typically works fine even with OneDrive sync.

### Environment Variables

- `AUTH_ALLOWED_EMAILS`: Comma-separated list of allowed email addresses
- `AUTH_SHARED_PASSWORD`: Single shared password for all users
- `LIFX_API_TOKEN`: Your LIFX Cloud API personal access token
- `LIFX_DEFAULT_SELECTOR`: Default light selector (e.g., "all", "label:Kitchen", "group:Bedroom")

### LIFX Selectors

You can use various selectors to target specific lights:
- `all` - All lights
- `id:d073d5...` - Specific light by ID
- `label:Kitchen` - Lights with specific label
- `group:Bedroom` - Lights in specific group
- `location:Home` - Lights in specific location

## Security Notes

- All routes except `/login` require authentication
- Authentication uses secure HTTP-only cookies
- LIFX API token is never exposed to the client
- All LIFX operations go through server-side API routes
- Password comparison is case-sensitive
- Email comparison is case-insensitive

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Ensure all environment variables are configured in your hosting platform
3. The `secure` flag on cookies will be enabled automatically in production
4. Consider using a more robust authentication system for wider access

## Troubleshooting

**Lights not appearing:**
- Verify your `LIFX_API_TOKEN` is correct
- Check that your lights are online in the LIFX app
- Verify `LIFX_DEFAULT_SELECTOR` matches your setup

**Login fails:**
- Double-check `AUTH_ALLOWED_EMAILS` and `AUTH_SHARED_PASSWORD`
- Ensure there are no extra spaces in email addresses
- Remember: emails are case-insensitive, password is case-sensitive

**Colors not updating:**
- Some LIFX bulbs have limited color capabilities
- Check the LIFX app to verify color is supported
- Try using hex colors like #ff0000 (red), #00ff00 (green), #0000ff (blue)

## License

This is a private project for personal use.
