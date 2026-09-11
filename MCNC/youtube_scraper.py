# WARLORD WASP // MCP TOOL: YOUTUBE TRANSCRIPT EXTRACTOR
# ASSIGNED: CHARLIE (CODE LEAD)
import sys
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi

def initialize_zero_state():
    """Zero-State Init to prevent NaN/Null poisoning in Monty's context"""
    return {"status": "init", "data": None, "error": None}

def extract_video_id(url):
    """Parses standard and shortened YT URLs"""
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    if match:
        return match.group(1)
    return None

def fetch_transcript(url):
    state = initialize_zero_state()
    try:
        video_id = extract_video_id(url)
        if not video_id:
            state["error"] = "CRITICAL FAILURE: Invalid YouTube URL format."
            return state
        
        transcript_data = None
        # Version-agnostic extraction
        try:
            # Classic method
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
        except AttributeError:
            # Newer version method
            api_instance = YouTubeTranscriptApi()
            transcript_data = api_instance.fetch(video_id)
            
        # Manually parse text to bypass TextFormatter structural changes
        text_parts = []
        for chunk in transcript_data:
            if hasattr(chunk, 'text'):
                text_parts.append(chunk.text)
            elif isinstance(chunk, dict) and 'text' in chunk:
                text_parts.append(chunk['text'])
            else:
                text_parts.append(str(chunk))
                
        text_output = " ".join(text_parts).replace('\n', ' ')
        
        state["status"] = "success"
        state["data"] = text_output
        return state
    except Exception as e:
        state["error"] = f"CRITICAL FAILURE: {str(e)}"
        return state

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "CRITICAL FAILURE: No URL provided by daemon."}))
        sys.exit(1)
        
    target_url = sys.argv[1]
    result = fetch_transcript(target_url)
    
    print(json.dumps(result))