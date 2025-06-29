import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY')
LASTFM_BASE_URL = 'http://ws.audioscrobbler.com/2.0/'


def test_lastfm_genre_top_tracks(genre='rock', limit=5):
    if not LASTFM_API_KEY or LASTFM_API_KEY == 'your-lastfm-api-key':
        print('❌ LASTFM_API_KEY is not set. Please set it in your .env file.')
        return

    params = {
        'method': 'tag.gettoptracks',
        'tag': genre,
        'api_key': LASTFM_API_KEY,
        'format': 'json',
        'limit': limit
    }

    try:
        response = requests.get(LASTFM_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        tracks = data.get('tracks', {}).get('track', [])
        if not tracks:
            print(f'❌ No tracks found for genre: {genre}')
            return
        print(f'✅ Top {limit} tracks for genre "{genre}":')
        for i, track in enumerate(tracks, 1):
            print(f"{i}. {track.get('name')} by {track.get('artist', {}).get('name')}")
    except Exception as e:
        print(f'❌ Error fetching tracks: {e}')


if __name__ == '__main__':
    test_lastfm_genre_top_tracks('rock', 5) 