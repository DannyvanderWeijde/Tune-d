# Tune-d

Music rating app build on the Spotify API. Rate your favorite tracks and get insights about your music taste. Favorite tracks, albums and artists are saved in your profile. And see what the community is saying about your favorite tracks, albums and artists.

## Start up

1. **Clone & Install:**
```bash
   git clone <your-repo-url>
   cd <project-folder>
   npm install
```

<br/>

2. **Environment Setup**
```bash
  cp .env.example .env
```

<br/>

3. **Database Setup**
```bash
  npx prisma db push
  npx prisma generate
```

<br/>

4. **Start the development server**
```bash
  npm run dev
```