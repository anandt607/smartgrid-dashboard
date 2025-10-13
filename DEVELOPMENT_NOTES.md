# Development Notes

## Important Information

### Running the Application

The SmartGrid dashboard is designed to run in **development mode** with Supabase configured. Due to the authentication and database requirements, the application needs environment variables to be set before it can run properly.

### Development Mode

To run in development mode:

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`.

### Build Considerations

**Note**: The production build (`npm run build`) requires valid Supabase credentials to succeed. This is because:

1. The app uses Supabase authentication
2. Pages attempt to fetch data during build time
3. Some pages are dynamically generated

### Setting Up for Production Build

Before building for production:

1. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```

2. **Add your Supabase credentials**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

3. **Set up the database**: Follow instructions in `SETUP_GUIDE.md`

4. **Then build**:
   ```bash
   npm run build
   ```

### Development Workflow

1. **Start with development mode**: Get the app running locally first
2. **Set up Supabase**: Create your database and tables
3. **Test features**: Try all authentication and data fetching
4. **Then build for production**: Once everything works in dev

### Package Dependencies

The project uses `@supabase/ssr` for proper Server-Side Rendering support with Next.js App Router. This package handles:
- Cookie-based authentication
- Server components
- Client components
- Middleware authentication

### Environment Variables

Required for the app to function:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Optional:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For billing features
- `NEXT_PUBLIC_API_URL` - API base URL (defaults to localhost:3000)

### Troubleshooting Build Issues

If build fails with Supabase errors:

1. **Check environment variables**: Make sure `.env.local` exists and has correct values
2. **Verify Supabase project**: Ensure your Supabase project is active
3. **Check database**: Verify tables are created as per SETUP_GUIDE.md
4. **Try development mode first**: `npm run dev` to see more detailed errors

### Static Generation vs Dynamic Rendering

Some pages in this app are configured for dynamic rendering because they:
- Require authentication
- Fetch user-specific data
- Use session information

This is normal for SaaS applications and doesn't impact performance negatively when deployed to platforms like Vercel.

### Recommended Development Setup

1. **VS Code** with extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets

2. **Browser DevTools**:
   - React Developer Tools
   - Redux DevTools (for TanStack Query DevTools)

3. **Terminal**:
   - Keep `npm run dev` running
   - Watch for errors in real-time

### Performance in Development

Development mode is slower than production because:
- Hot Module Replacement (HMR) is active
- Source maps are generated
- Additional debugging information is included

Production builds are optimized and much faster.

### Testing Without Building

You don't need to build the app to test it! Just use:

```bash
npm run dev
```

This is the recommended way to develop and test the application.

### When to Build

Build the application when you're ready to:
- Deploy to production
- Test production optimizations
- Verify bundle sizes
- Check for build-time errors

### Deployment

For deployment, the platform (Vercel, Netlify, etc.) will handle the build process automatically. Just make sure your environment variables are set in the platform's dashboard.

See `DEPLOYMENT.md` for detailed deployment instructions.

## Summary

✅ **Use `npm run dev` for development** - This is the primary way to work on the app  
✅ **Build only when ready for production** - Or when deploying  
✅ **Set up Supabase first** - Required for the app to function  
✅ **Environment variables are essential** - The app needs them to work  

Happy coding! 🚀
