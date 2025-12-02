import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Optional, Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Header

from ..models.meeting import MeetingCreationData, TranscriptChunk, MeetingStatus
from ..database.meetingHandler import MeetingHandler
from ..database.redisHandler import RedisHandler

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])

# -------------------------------------------------------------------
# Logger & handlers
# -------------------------------------------------------------------
logger = logging.getLogger("MeetingsRouter")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY")
meeting_handler = MeetingHandler()
redis_handler = RedisHandler()

# -------------------------------------------------------------------
# Dependencies
# -------------------------------------------------------------------
async def verify_internal_api_key(x_api_key: str = Header(...)):
    if x_api_key != INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key"
        )

# -------------------------------------------------------------------
# ------------------- CRUD ENDPOINTS -------------------
# -------------------------------------------------------------------
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_meeting_endpoint(meeting_data: MeetingCreationData, _: None = Depends(verify_internal_api_key)):
    new_meeting = await meeting_handler.create_meeting(meeting_data)

    state = {}
    state.update({"system": "connected", "system_bytes": 0, "system_chunks": 0})
    await redis_handler.set_json(state_key(new_meeting.id), state)

    if not new_meeting:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create meeting")
    return {"meeting_id": new_meeting.id, "vc_id": new_meeting.vc_id}

@router.get("/fetch/all")
async def get_all_meetings_endpoint(_: None = Depends(verify_internal_api_key)):
    output = await meeting_handler.get_all_meetings()
    if output is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No meetings found")
    return {"status": "success", "data": output}

@router.get("/fetch/{meeting_id}")
async def get_meeting_endpoint(meeting_id: str, _: None = Depends(verify_internal_api_key)):
    output = await meeting_handler.get_meeting_by_id(meeting_id)
    if output is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return {"status": "success", "data": output}


@router.get("/fetch_by_vc/{vc_id}")
async def get_meetings_by_vc_endpoint(vc_id: str, _: None = Depends(verify_internal_api_key)):
    output = await meeting_handler.get_meetings_by_vc_id(vc_id)
    if output is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No meetings found for the given VC ID")
    return {"status": "success", "data": output}


@router.put("/update")
async def update_meeting_endpoint(meeting: MeetingCreationData, _: None = Depends(verify_internal_api_key)):
    success = await meeting_handler.update_meeting(meeting)
    if not success:
        logger.error(f"Failed to update Meeting with ID: {meeting.id}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update meeting")
    logger.info(f"Updated Meeting with ID: {meeting.id}")
    return {"status": "success", "message": "Meeting updated successfully"}


@router.delete("/delete/{meeting_id}")
async def delete_meeting_endpoint(meeting_id: str, _: None = Depends(verify_internal_api_key)):
    meeting = await meeting_handler.get_meeting_by_id(meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    success = await meeting_handler.delete_meeting(meeting)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete meeting")
    logger.info(f"Meeting {meeting_id} deleted successfully")
    return {"status": "success", "message": "Meeting deleted successfully"}



# -------------------------------------------------------------------
# ------------------- REALTIME WEBSOCKETS -------------------
# -------------------------------------------------------------------

# Placeholder async callbacks
async def process_video_chunk(chunk: bytes) -> str:
    await asyncio.sleep(0.05)  # simulate delay
    return "processed video chunk"

async def process_audio_chunk(chunk: bytes) -> str:
    await asyncio.sleep(0.05)  # simulate delay
    return "transcribed audio chunk"

async def process_chat_query(text: str) -> str:
    await asyncio.sleep(0.05)
    return f"Chatbot reply: '{text}'"

# Generic WS session keys
def buffer_key(meeting_id: str, stream_type: str):
    return f"meeting:{meeting_id}:{stream_type}_buffer"

def state_key(meeting_id: str):
    return f"meeting:{meeting_id}:state"


# Dependancy for API handshake
async def websocket_handshake_auth(ws: WebSocket, meeting_id: str) -> bool:
    await ws.accept()

    # Step 1: tell the client what they need to do
    await ws.send_json({
        "type": "handshake_required",
        "msg": "Send { 'x_api_key': 'ABCD' } as your first message."
    })

    try:
        first_msg = await ws.receive_json()
    except Exception:
        await ws.send_json({"error": "Expected JSON with API key"})
        await ws.close(code=1008)
        return False

    client_key = first_msg.get("x_api_key")

    if client_key != INTERNAL_API_KEY:
        await ws.send_json({"error": "Invalid API key"})
        await ws.close(code=1008)
        return False

    await ws.send_json({"type": "handshake_ok", "msg": "Authentication successful!"})
    logger.info(f"[{meeting_id}] WS handshake ok")
    return True



# ------------------- VIDEO WS -------------------
@router.websocket("/ws/video/{meeting_id}")
async def video_ws(ws: WebSocket, meeting_id: str):

    if not await websocket_handshake_auth(ws, meeting_id):
        return

    meeting = await meeting_handler.get_meeting_by_id(meeting_id)
    if not meeting:
        await ws.send_json({"error": "meeting_not_found"})
        await ws.close(code=1008)
        return

    logger.info(f"[{meeting_id}] Video WS connected")

    # init redis state
    state = {"video": "connected", "video_bytes": 0, "video_chunks": 0}
    await redis_handler.set_json(state_key(meeting_id), state)

    try:
        while True:
            chunk = await ws.receive_bytes()

            await redis_handler.client.rpush(buffer_key(meeting_id, "video"), chunk)

            state = await redis_handler.get_json(state_key(meeting_id)) or {}
            state["video_bytes"] = state.get("video_bytes", 0) + len(chunk)
            state["video_chunks"] = state.get("video_chunks", 0) + 1
            await redis_handler.set_json(state_key(meeting_id), state)

            await ws.send_json({
                "type": "chunk_ack",
                "stream": "video",
                "chunk_count": state["video_chunks"],
                "received_bytes": state["video_bytes"]
            })

    except WebSocketDisconnect:
        logger.warning(f"[{meeting_id}] Video WS disconnected")


# ------------------- MIC WS -------------------
@router.websocket("/ws/audio/mic/{meeting_id}")
async def mic_ws(ws: WebSocket, meeting_id: str):

    if not await websocket_handshake_auth(ws, meeting_id):
        return

    meeting = await meeting_handler.get_meeting_by_id(meeting_id)
    if not meeting:
        await ws.send_json({"error": "meeting_not_found"})
        await ws.close(code=1008)
        return

    logger.info(f"[{meeting_id}] Mic WS connected")

    state = await redis_handler.get_json(state_key(meeting_id)) or {}
    state.update({"mic": "connected", "mic_bytes": 0, "mic_chunks": 0})
    await redis_handler.set_json(state_key(meeting_id), state)

    try:
        while True:
            chunk = await ws.receive_bytes()
            await redis_handler.client.rpush(buffer_key(meeting_id, "mic"), chunk)

            state = await redis_handler.get_json(state_key(meeting_id)) or {}
            state["mic_bytes"] += len(chunk)
            state["mic_chunks"] += 1
            await redis_handler.set_json(state_key(meeting_id), state)

            await ws.send_json({
                "type": "chunk_ack",
                "stream": "mic",
                "chunk_count": state["mic_chunks"],
                "received_bytes": state["mic_bytes"]
            })

    except WebSocketDisconnect:
        logger.warning(f"[{meeting_id}] Mic WS disconnected")

# ------------------- SYSTEM AUDIO WS -------------------
@router.websocket("/ws/audio/system/{meeting_id}")
async def system_ws(ws: WebSocket, meeting_id: str):

    if not await websocket_handshake_auth(ws, meeting_id):
        return

    meeting = await meeting_handler.get_meeting_by_id(meeting_id)
    if not meeting:
        await ws.send_json({"error": "meeting_not_found"})
        await ws.close(code=1008)
        return

    logger.info(f"[{meeting_id}] System WS connected")

    state = await redis_handler.get_json(state_key(meeting_id)) or {}
    state.update({"system": "connected", "system_bytes": 0, "system_chunks": 0})
    await redis_handler.set_json(state_key(meeting_id), state)

    try:
        while True:
            chunk = await ws.receive_bytes()
            await redis_handler.client.rpush(buffer_key(meeting_id, "system"), chunk)

            state = await redis_handler.get_json(state_key(meeting_id)) or {}
            state["system_bytes"] += len(chunk)
            state["system_chunks"] += 1
            await redis_handler.set_json(state_key(meeting_id), state)

            await ws.send_json({
                "type": "chunk_ack",
                "stream": "system",
                "chunk_count": state["system_chunks"],
                "received_bytes": state["system_bytes"]
            })

    except WebSocketDisconnect:
        logger.warning(f"[{meeting_id}] System WS disconnected")

# ------------------- CHAT WS -------------------
@router.websocket("/ws/chat/{meeting_id}")
async def chat_ws(ws: WebSocket, meeting_id: str):

    if not await websocket_handshake_auth(ws, meeting_id):
        return

    meeting = await meeting_handler.get_meeting_by_id(meeting_id)
    if not meeting:
        await ws.send_json({"error": "meeting_not_found"})
        await ws.close(code=1008)
        return

    logger.info(f"[{meeting_id}] Chat WS connected")

    try:
        while True:
            msg = await ws.receive_text()

            meeting = await meeting_handler.get_meeting_by_id(meeting_id)
            if meeting:
                meeting.chat_history.append(
                    TranscriptChunk(
                        timestamp=datetime.datetime.now().timestamp(),
                        speaker="user",
                        text=msg
                    )
                )
                await meeting_handler.update_meeting(meeting)

            reply = await process_chat_query(msg)

            if meeting:
                meeting.chat_history.append(
                    TranscriptChunk(
                        timestamp=datetime.datetime.now().timestamp(),
                        speaker="assistant",
                        text=reply
                    )
                )
                await meeting_handler.update_meeting(meeting)

            await ws.send_text(reply)

    except WebSocketDisconnect:
        logger.warning(f"[{meeting_id}] Chat WS disconnected")

# ------------------- STATUS -------------------
@router.get("/status/{meeting_id}")
async def get_meeting_status(meeting_id: str,  _: None = Depends(verify_internal_api_key)):
    state = await redis_handler.get_json(state_key(meeting_id))
    return state or {}

# ------------------- END MEETING -------------------
@router.delete("/{meeting_id}")
async def end_meeting(meeting_id: str,  _: None = Depends(verify_internal_api_key)):
    logger.info(f"[{meeting_id}] Ending meeting and clearing buffers")

    await redis_handler.delete(buffer_key(meeting_id, "video"))
    await redis_handler.delete(buffer_key(meeting_id, "mic"))
    await redis_handler.delete(buffer_key(meeting_id, "system"))
    await redis_handler.delete(state_key(meeting_id))

    meeting = await meeting_handler.get_meeting_by_id(meeting_id)
    if meeting:
        meeting.status = MeetingStatus.COMPLETED
        meeting.end_time = datetime.now()
        await meeting_handler.update_meeting(meeting)

    return {"message": "Meeting ended and buffers cleared"}
