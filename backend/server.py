from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import re
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# YouTube API Key
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', 'ABCdef123123')

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ------------------ MODELS ------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class VideoData(BaseModel):
    id: str
    title: str
    description: str
    thumbnail: str
    publishedAt: str
    viewCount: int
    likeCount: int
    commentCount: int
    duration: str
    estimatedRevenue: Optional[float] = 0.0
    country_views: Optional[Dict[str, int]] = Field(default_factory=dict)  # Views by country


class ChannelVideosResponse(BaseModel):
    success: bool
    channel_id: Optional[str] = None
    channel_title: Optional[str] = None
    channel_created_at: Optional[str] = None
    total_channel_views: Optional[int] = 0
    lifetime_estimated_revenue: Optional[float] = 0.0
    videos: List[VideoData] = Field(default_factory=list)
    total: int = 0
    error: Optional[str] = None


# ------------------ YOUTUBE HELPERS ------------------
def extract_channel_id(channel_input: str) -> str:
    handle_pattern = r'youtube\.com/@([^/\?&]+)'
    channel_pattern = r'youtube\.com/channel/([^/\?&]+)'
    direct_id_pattern = r'^UC[a-zA-Z0-9_-]{22}$'

    handle_match = re.search(handle_pattern, channel_input)
    if handle_match:
        return f"@{handle_match.group(1)}"
    channel_match = re.search(channel_pattern, channel_input)
    if channel_match:
        return channel_match.group(1)
    if re.match(direct_id_pattern, channel_input):
        return channel_input
    if channel_input.startswith('@'):
        return channel_input
    if not channel_input.startswith('UC'):
        return f"@{channel_input}"
    return channel_input


def get_youtube_service():
    return build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)


def get_channel_uploads_playlist(youtube, channel_identifier: str):
    try:
        if channel_identifier.startswith('UC'):
            request = youtube.channels().list(
                part='contentDetails,snippet,statistics',
                id=channel_identifier
            )
        else:
            request = youtube.channels().list(
                part='contentDetails,snippet,statistics',
                forHandle=channel_identifier.lstrip('@')
            )
        response = request.execute()
        if not response.get('items'):
            return None, None, None, None, None
        channel = response['items'][0]
        stats = channel.get('statistics', {})
        snippet = channel['snippet']
        total_views = int(stats.get('viewCount', 0))
        created_at = snippet.get('publishedAt')
        uploads_playlist_id = channel['contentDetails']['relatedPlaylists']['uploads']
        channel_id = channel['id']
        channel_title = snippet.get('title')
        return uploads_playlist_id, channel_id, channel_title, total_views, created_at
    except HttpError as e:
        logger.error(f"Error fetching channel: {e}")
        return None, None, None, None, None


def get_videos_from_playlist(youtube, playlist_id: str, max_results: int) -> List[str]:
    video_ids = []
    next_page_token = None
    try:
        while len(video_ids) < max_results:
            request = youtube.playlistItems().list(
                part='contentDetails',
                playlistId=playlist_id,
                maxResults=min(50, max_results - len(video_ids)),
                pageToken=next_page_token
            )
            response = request.execute()
            for item in response.get('items', []):
                video_ids.append(item['contentDetails']['videoId'])
            next_page_token = response.get('nextPageToken')
            if not next_page_token or len(video_ids) >= max_results:
                break
        return video_ids[:max_results]
    except HttpError as e:
        logger.error(f"Error fetching playlist items: {e}")
        return []


# ------------------ REVENUE ESTIMATION ------------------
# Approx CPM per country (USD per 1000 views)
COUNTRY_CPM = {
    "US": 4.0,
    "GB": 3.5,
    "CA": 3.2,
    "AU": 3.0,
    "IN": 0.3,
    "PK": 0.25,
    "BD": 0.2,
    "DEFAULT": 1.0
}


def estimate_revenue_advanced(view_count: int, duration: str, country_distribution: Optional[Dict[str, int]] = None) -> float:
    """Estimate revenue using duration and country CPM"""
    minutes, seconds = 0, 0
    match = re.match(r"PT(?:(\d+)M)?(?:(\d+)S)?", duration)
    if match:
        minutes = int(match.group(1) or 0)
        seconds = int(match.group(2) or 0)
    total_seconds = minutes * 60 + seconds

    if total_seconds <= 60:
        base_multiplier = 0.5  # Shorts lower revenue
    else:
        base_multiplier = 1.0

    total_revenue = 0.0

    if country_distribution:
        for country, views in country_distribution.items():
            cpm = COUNTRY_CPM.get(country, COUNTRY_CPM['DEFAULT'])
            total_revenue += (views / 1000) * cpm * base_multiplier
    else:
        # If no country data, use default CPM
        total_revenue = (view_count / 1000) * COUNTRY_CPM['DEFAULT'] * base_multiplier

    return round(total_revenue, 2)


def get_video_details(youtube, video_ids: List[str]) -> List[VideoData]:
    videos_data = []
    try:
        for i in range(0, len(video_ids), 50):
            batch_ids = video_ids[i:i + 50]
            request = youtube.videos().list(
                part='snippet,contentDetails,statistics',
                id=','.join(batch_ids)
            )
            response = request.execute()
            for item in response.get('items', []):
                try:
                    snippet = item['snippet']
                    stats = item.get('statistics', {})
                    content_details = item['contentDetails']

                    # Placeholder: distribute views randomly across countries (for demo)
                    country_views = {
                        "US": int(0.3 * int(stats.get("viewCount", 0))),
                        "IN": int(0.5 * int(stats.get("viewCount", 0))),
                        "GB": int(0.2 * int(stats.get("viewCount", 0)))
                    }

                    video_data = VideoData(
                        id=item['id'],
                        title=snippet['title'],
                        description=snippet.get('description', ''),
                        thumbnail=snippet['thumbnails'].get('medium', {}).get('url', ''),
                        publishedAt=snippet['publishedAt'],
                        viewCount=int(stats.get('viewCount', 0)),
                        likeCount=int(stats.get('likeCount', 0)),
                        commentCount=int(stats.get('commentCount', 0)),
                        duration=content_details['duration'],
                        country_views=country_views,
                        estimatedRevenue=estimate_revenue_advanced(
                            int(stats.get("viewCount", 0)),
                            content_details["duration"],
                            country_views
                        )
                    )
                    videos_data.append(video_data)
                except Exception as e:
                    logger.error(f"Error parsing video data: {e}")
                    continue
        return videos_data
    except HttpError as e:
        logger.error(f"Error fetching video details: {e}")
        return []


# ------------------ API ROUTES ------------------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.get("/youtube/channel-videos", response_model=ChannelVideosResponse)
async def get_channel_videos(
    channel: str = Query(..., description="YouTube channel URL or ID"),
    count: int = Query(..., ge=1, le=500, description="Number of videos to fetch (1-500)")
):
    try:
        channel_identifier = extract_channel_id(channel)
        logger.info(f"Fetching videos for channel: {channel_identifier}")

        if YOUTUBE_API_KEY == 'ABCdef123123':
            return ChannelVideosResponse(
                success=False,
                error="YouTube API key not configured. Please add your API key to the backend/.env file."
            )

        youtube = get_youtube_service()
        uploads_playlist_id, channel_id, channel_title, total_views, created_at = get_channel_uploads_playlist(
            youtube, channel_identifier
        )

        if not uploads_playlist_id:
            return ChannelVideosResponse(success=False, error="Channel not found.")

        video_ids = get_videos_from_playlist(youtube, uploads_playlist_id, count)

        if not video_ids:
            # Estimate lifetime revenue based on total channel views
            lifetime_revenue = estimate_revenue_advanced(total_views, "PT10M")
            return ChannelVideosResponse(
                success=True,
                channel_id=channel_id,
                channel_title=channel_title,
                channel_created_at=created_at,
                total_channel_views=total_views,
                lifetime_estimated_revenue=lifetime_revenue,
                videos=[],
                total=0
            )

        videos = get_video_details(youtube, video_ids)

        # Calculate lifetime revenue as sum of all videos’ revenue (could be adjusted)
        fetched_revenue = sum(v.estimatedRevenue for v in videos)
        lifetime_revenue = estimate_revenue_advanced(total_views, "PT10M")  # channel total views

        return ChannelVideosResponse(
            success=True,
            channel_id=channel_id,
            channel_title=channel_title,
            channel_created_at=created_at,
            total_channel_views=total_views,
            lifetime_estimated_revenue=lifetime_revenue,
            videos=videos,
            total=len(videos)
        )

    except HttpError as e:
        error_message = str(e)
        if 'keyInvalid' in error_message or 'API key not valid' in error_message:
            error_message = "Invalid YouTube API key."
        elif 'quotaExceeded' in error_message:
            error_message = "YouTube API quota exceeded."
        logger.error(f"YouTube API Error: {error_message}")
        return ChannelVideosResponse(success=False, error=error_message)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return ChannelVideosResponse(success=False, error=f"Unexpected error: {str(e)}")


# ------------------ APP SETUP ------------------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
