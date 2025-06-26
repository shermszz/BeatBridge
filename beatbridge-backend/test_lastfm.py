#!/usr/bin/env python3
"""
Test script for Last.fm API integration
Run this to verify the API endpoints work correctly
"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY', 'your-lastfm-api-key')
LASTFM_BASE_URL = 'http://ws.audioscrobbler.com/2.0/'

def test_get_genres():
    """Test getting genres from Last.fm"""
    print("Testing genre fetching...")
    
    params = {
        'method': 'chart.gettoptags',
        'api_key': LASTFM_API_KEY,
        'format': 'json',
        'limit': 10  # Just get 10 for testing
    }
    
    try:
        response = requests.get(LASTFM_BASE_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        if 'toptags' in data and 'tag' in data['toptags']:
            print(f"✅ Successfully fetched {len(data['toptags']['tag'])} genres")
            print("Sample genres:")
            for i, tag in enumerate(data['toptags']['tag'][:5]):
                print(f"  {i+1}. {tag['name']} ({tag['count']} tracks)")
            return True
        else:
            print("❌ No genres found in response")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Error fetching genres: {e}")
        return False

def test_get_tracks_for_genre(genre='rock'):
    """Test getting tracks for a specific genre"""
    print(f"\nTesting track fetching for genre: {genre}")
    
    params = {
        'method': 'tag.gettoptracks',
        'tag': genre,
        'api_key': LASTFM_API_KEY,
        'format': 'json',
        'limit': 5  # Just get 5 for testing
    }
    
    try:
        response = requests.get(LASTFM_BASE_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        if 'tracks' in data and 'track' in data['tracks']:
            print(f"✅ Successfully fetched {len(data['tracks']['track'])} tracks")
            print("Sample tracks:")
            for i, track in enumerate(data['tracks']['track'][:3]):
                print(f"  {i+1}. {track['name']} by {track['artist']['name']}")
            return True
        else:
            print("❌ No tracks found in response")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Error fetching tracks: {e}")
        return False

def main():
    print("🎵 Testing Last.fm API Integration")
    print("=" * 40)
    
    if LASTFM_API_KEY == 'your-lastfm-api-key':
        print("❌ Please set your LASTFM_API_KEY in the .env file")
        print("   Get your API key from: https://www.last.fm/api/account/create")
        return
    
    # Test genre fetching
    genres_ok = test_get_genres()
    
    # Test track fetching
    tracks_ok = test_get_tracks_for_genre()
    
    print("\n" + "=" * 40)
    if genres_ok and tracks_ok:
        print("✅ All tests passed! Last.fm API integration is working correctly.")
        print("   You can now use the song recommendation feature in BeatBridge.")
    else:
        print("❌ Some tests failed. Please check your API key and internet connection.")
        print("   Make sure you have a valid Last.fm API key in your .env file.")

if __name__ == "__main__":
    main() 