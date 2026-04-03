export function getEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');

    // YouTube
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (urlObj.pathname === '/watch') {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } else if (urlObj.pathname === '/') {
        // YouTube homepage blocks iframes, use Piped as an alternative frontend
        return 'https://piped.video/';
      } else if (urlObj.pathname.startsWith('/results')) {
        return `https://piped.video${urlObj.pathname}${urlObj.search}`;
      }
    }
    if (hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // Spotify
    if (hostname === 'open.spotify.com') {
      if (!urlObj.pathname.startsWith('/embed/')) {
        return `https://open.spotify.com/embed${urlObj.pathname}`;
      }
    }

    // Twitch
    if (hostname === 'twitch.tv') {
      const channel = urlObj.pathname.slice(1);
      if (channel) {
        const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        return `https://player.twitch.tv/?channel=${channel}&parent=${parent}`;
      }
    }

    return url;
  } catch (e) {
    return url;
  }
}
