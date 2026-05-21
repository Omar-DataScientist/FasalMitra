"""
PITAMBAR — multimodal/speech_to_text.py
Improved Speech-to-Text using openai-whisper (local, free).

Features:
- Lazy-loaded Whisper model
- Better transcription quality
- Detailed debugging output
- Segment-level confidence logging
- Automatic language detection
- ffmpeg pre-flight checks

REQUIREMENT:
ffmpeg must be installed and available on PATH.

Windows :
    winget install ffmpeg
    OR
    choco install ffmpeg

Linux :
    sudo apt install ffmpeg

macOS :
    brew install ffmpeg
"""

import asyncio
import logging
import os
import shutil
import tempfile

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level lazy cache
# ---------------------------------------------------------------------------
_whisper_model = None


# ---------------------------------------------------------------------------
# ffmpeg pre-flight check
# ---------------------------------------------------------------------------
def _check_ffmpeg() -> None:
    """Raise RuntimeError with a clear install message if ffmpeg is missing."""
    if shutil.which("ffmpeg") is None:
        raise RuntimeError(
            "ffmpeg not found on PATH — Whisper requires it to decode audio.\n"
            "Windows : winget install ffmpeg OR choco install ffmpeg\n"
            "Linux   : sudo apt install ffmpeg\n"
            "macOS   : brew install ffmpeg\n"
            "After installing, restart your terminal so PATH is refreshed."
        )


# ---------------------------------------------------------------------------
# Lazy model loader
# ---------------------------------------------------------------------------
def _get_model():
    """
    Load Whisper model once and cache it.
    Also verifies ffmpeg is present.
    """
    global _whisper_model

    if _whisper_model is None:
        _check_ffmpeg()

        try:
            import whisper  # noqa: PLC0415

            try:
                from config.settings import settings  # noqa: PLC0415

                # Better default model for Indian languages
                model_name: str = getattr(
                    settings,
                    "WHISPER_MODEL",
                    "small"
                )

            except Exception:
                model_name = "small"

            logger.info(
                "Loading Whisper model '%s' "
                "(first call — may download model files)...",
                model_name,
            )

            _whisper_model = whisper.load_model(model_name)

            logger.info(
                "Whisper model '%s' loaded successfully.",
                model_name,
            )

        except Exception as exc:
            logger.error("Failed to load Whisper model: %s", exc)
            raise

    return _whisper_model


# ---------------------------------------------------------------------------
# Core sync helper — runs in asyncio.to_thread
# ---------------------------------------------------------------------------
def _transcribe_sync(audio_bytes: bytes) -> dict:
    """
    Synchronous transcription helper.
    Runs inside asyncio.to_thread().
    """

    tmp_path: str | None = None

    try:
        model = _get_model()

        # -------------------------------------------------------------------
        # Write temporary audio file
        # -------------------------------------------------------------------
        with tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False,
        ) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # -------------------------------------------------------------------
        # Improved transcription settings
        # -------------------------------------------------------------------
        result = model.transcribe(
            tmp_path,

            # Auto-detect language
            language=None,

            # CPU-safe
            fp16=False,

            # Better decoding
            temperature=0,

            # Better beam search
            beam_size=5,

            # Multiple decoding attempts
            best_of=5,

            # More stable output
            condition_on_previous_text=True,

            # Helps with noisy audio
            compression_ratio_threshold=2.4,

            # Detect silence better
            no_speech_threshold=0.6,
        )

        # -------------------------------------------------------------------
        # Extract main values
        # -------------------------------------------------------------------
        text: str = result.get("text", "").strip()

        detected_lang: str = result.get("language", "unknown")

        segments = result.get("segments", [])

        # -------------------------------------------------------------------
        # Confidence calculation
        # -------------------------------------------------------------------
        if segments:
            avg_lp = (
                sum(
                    s.get("avg_logprob", -1.0)
                    for s in segments
                ) / len(segments)
            )

            confidence = float(
                max(0.0, min(1.0, 1.0 + avg_lp))
            )

        else:
            confidence = 0.0

        # -------------------------------------------------------------------
        # DEBUG OUTPUT
        # -------------------------------------------------------------------
        print("\n" + "=" * 60)
        print("WHISPER DEBUG")
        print("=" * 60)

        print(f"Detected Language : {detected_lang}")
        print(f"Final Text        : {text}")
        print(f"Confidence        : {confidence:.3f}")

        if not segments:
            print("\nNo segments detected.")

        for i, seg in enumerate(segments):
            print("\n" + "-" * 50)
            print(f"Segment {i + 1}")
            print("-" * 50)

            print(
                f"Time              : "
                f"{seg.get('start')}s -> {seg.get('end')}s"
            )

            print(
                f"Text              : "
                f"{seg.get('text')}"
            )

            print(
                f"Avg Log Prob      : "
                f"{seg.get('avg_logprob')}"
            )

            print(
                f"No Speech Prob    : "
                f"{seg.get('no_speech_prob')}"
            )

            print(
                f"Compression Ratio : "
                f"{seg.get('compression_ratio')}"
            )

        print("=" * 60 + "\n")

        # -------------------------------------------------------------------
        # Return structured response
        # -------------------------------------------------------------------
        return {
            "text": text,
            "language": detected_lang,
            "confidence": confidence,
            "segments": segments,
            "error": None,
        }

    except Exception as exc:
        logger.error("Whisper transcription error: %s", exc)

        return {
            "text": "",
            "language": "unknown",
            "confidence": 0.0,
            "segments": [],
            "error": str(exc),
        }

    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)

            except OSError as e:
                logger.warning(
                    "Could not delete temp file %s: %s",
                    tmp_path,
                    e,
                )


# ---------------------------------------------------------------------------
# Public async API
# ---------------------------------------------------------------------------
async def transcribe(
    audio_bytes: bytes,
    language: str = "hi",
) -> dict:
    """
    Transcribe raw audio bytes using Whisper.

    Args:
        audio_bytes:
            Raw WAV/MP3/etc content.

        language:
            Kept for compatibility but ignored now
            because auto-detection works better.

    Returns:
        {
            "text": str,
            "language": str,
            "confidence": float,
            "segments": list,
            "error": str | None,
        }
    """

    if not audio_bytes:
        return {
            "text": "",
            "language": "unknown",
            "confidence": 0.0,
            "segments": [],
            "error": "Empty audio bytes received.",
        }

    return await asyncio.to_thread(
        _transcribe_sync,
        audio_bytes,
    )


# ---------------------------------------------------------------------------
# Standalone test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format=(
            "%(asctime)s | "
            "%(levelname)-8s | "
            "%(name)s | "
            "%(message)s"
        ),
        datefmt="%Y-%m-%dT%H:%M:%S",
    )

    async def _test():
        print("\n=== PITAMBAR Speech-to-Text Test ===\n")

        try:
            _check_ffmpeg()
            print("ffmpeg : FOUND ✓")

        except RuntimeError as e:
            print(f"ffmpeg : NOT FOUND ✗\n\n{e}")
            sys.exit(1)

        # ---------------------------------------------------------------
        # Use supplied file
        # ---------------------------------------------------------------
        if len(sys.argv) > 1:
            audio_path = sys.argv[1]

            print(f"Audio file : {audio_path}")

            with open(audio_path, "rb") as f:
                audio = f.read()

        else:
            print(
                "Usage:\n"
                "python -m multimodal.speech_to_text path/to/audio.wav"
            )
            return

        # ---------------------------------------------------------------
        # Run transcription
        # ---------------------------------------------------------------
        result = await transcribe(audio)

        print("\n" + "=" * 60)
        print("FINAL RESULT")
        print("=" * 60)

        if result["error"]:
            print(f"Error      : {result['error']}")

        else:
            print(f"Text       : {result['text']}")
            print(f"Language   : {result['language']}")
            print(f"Confidence : {result['confidence']:.3f}")

        print("=" * 60)

    asyncio.run(_test())