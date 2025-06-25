import { SaavnSearchResponse, SaavnSong, Song } from '@/components/types';

const SAAVN_API_BASE = 'https://jiosavan-api2.vercel.app/api';



  function decodeHtmlEntities(text: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}

export class SaavnApiService {
  static async searchSongs(query: string): Promise<Song[]> {
    try {
      const response = await fetch(`${SAAVN_API_BASE}/search/songs?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SaavnSearchResponse = await response.json();
      
      if (!data.success || !data.data.results) {
        return [];
      }
      
      return data.data.results.map(this.transformSaavnSongToSong);
    } catch (error) {
      console.error('Error searching songs:', error);
      return [];
    }
  }



  private static transformSaavnSongToSong(saavnSong: SaavnSong): Song {
    // Get the highest quality image
    const image = saavnSong.image.find(img => img.quality === '500x500') || 
                  saavnSong.image.find(img => img.quality === '150x150') || 
                  saavnSong.image[0];

    // Get the 320kbps audio URL
    const audioUrl = saavnSong.downloadUrl.find(url => url.quality === '320kbps')?.url || 
                     saavnSong.downloadUrl[saavnSong.downloadUrl.length - 1]?.url;

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds: number | null): string => {
      if (!seconds) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get primary artist name
    const primaryArtist = saavnSong.artists.primary[0]?.name || 'Unknown Artist';
    
    // Get album name
    const albumName = saavnSong.album.name || 'Unknown Album';

    return {
      id: saavnSong.id,
     title: decodeHtmlEntities(saavnSong.name),
     artist: decodeHtmlEntities(primaryArtist),
     album: decodeHtmlEntities(albumName),
      duration: formatDuration(saavnSong.duration),
      poster: image?.url || '',
      audioUrl: audioUrl,
      colors: {
        primary: "#1a1a2e",
        secondary: "#16213e", 
        accent: "#533483"
      }
    };
  }

  static async getSongById(id: string): Promise<Song | null> {
    try {
      const response = await fetch(`${SAAVN_API_BASE}/songs/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data[0]) {
        return null;
      }
      
      return this.transformSaavnSongToSong(data.data[0]);
    } catch (error) {
      console.error('Error fetching song:', error);
      return null;
    }
  }

  // Get song recommendations based on current song
  static async getSongRecommendations(songId: string): Promise<Song[]> {
    try {
      const response = await fetch(`${SAAVN_API_BASE}/songs/${songId}/suggestions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return [];
      }
      
      return data.data.map(this.transformSaavnSongToSong);
    } catch (error) {
      console.error('Error fetching song recommendations:', error);
      return [];
    }
  }

  // Get trending/featured songs as fallback
  static async getTrendingSongs(): Promise<Song[]> {
    try {
      // Using search with popular terms as fallback since trending endpoint might not exist
      const popularQueries = ['trending', 'popular', 'latest', 'bollywood', 'hindi'];
      const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
      
      const response = await fetch(`${SAAVN_API_BASE}/search/songs?query=${encodeURIComponent(randomQuery)}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SaavnSearchResponse = await response.json();
      
      if (!data.success || !data.data.results) {
        return [];
      }
      
      return data.data.results.slice(0, 10).map(this.transformSaavnSongToSong);
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      return [];
    }
  }

  // Get related songs based on artist
  static async getArtistSongs(artistName: string): Promise<Song[]> {
    try {
      const response = await fetch(`${SAAVN_API_BASE}/search/songs?query=${encodeURIComponent(artistName)}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SaavnSearchResponse = await response.json();
      
      if (!data.success || !data.data.results) {
        return [];
      }
      
      return data.data.results.slice(0, 10).map(this.transformSaavnSongToSong);
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      return [];
    }
  }
}