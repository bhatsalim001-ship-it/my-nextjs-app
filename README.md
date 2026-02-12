# SecureForce - Enterprise Security Manpower Management System

A modern, production-ready employee and security personnel management system built with Next.js, Supabase, and TypeScript.

## 🌟 Features

### Core Functionality
- **Employee Management**: Complete CRUD operations with role-based access control
- **Dynamic Departments, Designations, Locations**: Admin-managed organizational structure
- **ID Card Generation**: 10+ professional templates with QR code verification
- **Photo Management**: Cloud-based photo storage with automatic resizing
- **Export & Backup**: CSV, JSON exports and cloud backups
- **QR Code Verification**: Public verification endpoint for ID verification

### Security Features
- **Supabase Auth**: Email/password authentication with password recovery
- **Row-Level Security (RLS)**: Database-level security policies
- **Rate Limiting**: Protection against brute force attempts
- **Session Timeout**: Automatic logout after 30 minutes of inactivity
- **Security Headers**: Comprehensive HTTP security headers
- **Input Validation**: Zod-based form validation
- **Error Boundary**: Global error handling and logging

### Admin Dashboard
- Analytics and reporting
- User management with role assignment
- Company settings and branding
- Activity logs for audit trails
- Backup management
- Export functionality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- npm or yarn package manager
- Git
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd security-manpower-app
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up database**
   ```bash
   # Run migrations in Supabase SQL Editor using migrations files
   # Or use your Supabase dashboard to run SQL files from migrations folder
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3002](http://localhost:3002) in your browser.

   > Note: If port 3000 is in use, the dev server automatically uses port 3002

### Getting Supabase Credentials

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner toasts

## 📁 Project Structure

```
security-manpower-app/
├── app/
│   ├── admin/               # Admin dashboard pages
│   ├── auth/                # Authentication pages
│   ├── verify/              # Public verification endpoint
│   └── page.tsx             # Home page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── error-boundary.tsx   # Global error handling
│   ├── id-card-renderer.tsx # Dynamic card rendering
│   └── ...
├── lib/
│   ├── auth.ts             # Authentication context & hooks
│   ├── supabase.ts         # Supabase client setup
│   ├── validators.ts       # Zod schemas
│   ├── error-handler.ts    # Error handling utilities
│   ├── config.ts           # App configuration
│   ├── card-templates.ts   # ID card templates
│   └── ...
├── middleware.ts            # Authentication & rate limiting
├── .env.example            # Environment variables template
└── package.json
```

## 🔐 Authentication

### Login
- Navigate to `/auth/login`
- Enter email and password
- Access restricted to admin/super_admin roles

### Signup (Admin Only)
- Admin users can invite new users
- Password must be strong (8+ chars, uppercase, lowercase, number, special char)
- Email verification required

### Password Recovery
- Click "Forgot Password" on login page
- Enter email to receive reset link
- Follow link to set new password

### Session Security
- Sessions timeout after 30 minutes of inactivity
- Activity is tracked: mouse, keyboard, scroll, touch
- Automatic logout with notification

## 📊 Database Schema

### Core Tables
- `employees` - Employee records with all details
- `user_profiles` - User authentication profiles
- `departments` - Organization departments
- `designations` - Job designations
- `locations` - Office locations
- `company_settings` - Company branding and info

### Support Tables
- `id_card_templates` - Card template configurations
- `activity_logs` - Audit trail
- `backups` - Backup metadata

All tables have Row-Level Security (RLS) enabled.

## 🎨 ID Card Templates

Pre-built templates include:
1. Modern Blue - Professional blue design
2. Corporate Red - Bold red accent
3. Minimal Clean - Minimalist style
4. Dark Theme - Dark background
5. Gradient Premium - Elegant gradient
6. Security Guard - Security-focused
7. Corporate Teal - Teal accent
8. Gold Luxury - Premium gold
9. Vertical Badge - Lanyard format
10. Dual Photo - Two photo support

Templates support:
- Dynamic variable substitution
- Custom colors and fonts
- Logo and photo placement
- QR code with verification URL
- Print-optimized sizing

## 📤 Export & Backup

### Exports Supported
- **CSV**: Employee list with selected columns
- **JSON**: Complete database snapshot with relationships

### Backup Features
- Create timestamped backups
- Store in Supabase Storage
- Download for offline storage
- Delete old backups
- Automatic retention (90 days)

## 🔗 API Endpoints

### Public Endpoints
- `GET /verify/[employeeId]` - Public employee verification

### Protected Endpoints (Admin)
- `/admin/employees` - Employee CRUD
- `/admin/departments` - Department CRUD
- `/admin/designations` - Designation CRUD
- `/admin/locations` - Location CRUD
- `/admin/id-cards` - Card generation
- `/admin/templates` - Template management
- `/admin/settings` - Company settings
- `/admin/export-backup` - Export and backup

## 🛡️ Security

### Implemented Measures
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection (Next.js built-in)
- ✅ Rate limiting (10 auth attempts per 15 min)
- ✅ Session timeout (30 minutes idle)
- ✅ Password requirements (8+ chars, complexity)
- ✅ RLS at database level
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ No hardcoded secrets
- ✅ Environment variable validation

### Best Practices
- Never commit `.env.local`
- Keep dependencies updated
- Regular security audits
- Monitor audit logs
- Backup data regularly
- Use strong passwords

## 📈 Performance

### Optimization Features
- Database query pagination
- Image optimization (Supabase)
- Component lazy loading
- React Query caching (optional)
- Middleware-based rate limiting
- Indexed database queries

### Performance Targets
- Page load: < 3 seconds
- List queries (1000 items): < 1 second
- Export (5000 records): < 5 seconds

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy (automatic on push)

For detailed deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
SUPABASE_SERVICE_ROLE_KEY=production-service-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🧪 Testing

### Manual Testing
```bash
# Login flow
1. Navigate to login page
2. Enter test credentials
3. Verify dashboard loads

# CRUD Operations
1. Create employee with photo
2. Edit employee details
3. Delete employee (with confirmation)
4. Verify in database

# Export/Backup
1. Create backup
2. Download backup file
3. Export as CSV/JSON
```

### Build Testing
```bash
npm run build
npm run lint
npm run type-check
```

## 📚 Documentation

- [Deployment Guide](./VERCEL_DEPLOYMENT.md) - Production deployment
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification
- [Environment Variables](./.env.example) - Configuration reference

## 🐛 Troubleshooting

### Common Issues

**"Database connection refused"**
- Verify Supabase URL and keys
- Check if Supabase project is active
- Verify network connectivity

**"Authentication failed"**
- Check email provider is enabled in Supabase Auth
- Verify user exists in database
- Check RLS policies

**"File upload fails"**
- Verify bucket exists in Supabase Storage
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP)

**"Rate limit exceeded"**
- Wait 15 minutes for auth rate limit reset
- Reduce rapid API calls if possible
- Contact support for high-volume scenarios

For more help, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md#troubleshooting)

## 📞 Support

- **Issues**: Report bugs in GitHub Issues
- **Discussions**: GitHub Discussions for questions
- **Documentation**: Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Supabase Help**: https://supabase.com/docs

## 📄 License

[Specify your license here - MIT, Apache, etc.]

## 🎉 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Happy coding! 🚀**

For production deployment, follow the [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md).
