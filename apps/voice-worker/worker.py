"""Offline one-shot worker. stdin/stdout protocol only; no audio file writes."""
import base64
import io
import json
import os
from pathlib import Path
import sys
import wave

MAX_INPUT = 1_300_000

def transcribe(payload, model_path, engine=None):
    if not isinstance(payload, dict) or payload.get('language') not in ('ar', 'en', 'auto'):
        raise ValueError('invalid_request')
    encoded = payload.get('audio')
    if not isinstance(encoded, str) or len(encoded) > 1_280_060:
        raise ValueError('invalid_audio')
    audio = base64.b64decode(encoded, validate=True)
    if len(audio) > 960044:
        raise ValueError('invalid_audio')
    with wave.open(io.BytesIO(audio), 'rb') as wav:
        frames = wav.getnframes()
        if wav.getnchannels() != 1 or wav.getframerate() != 16000 or wav.getsampwidth() != 2 or not 1 <= frames <= 480000 or wav.getcomptype() != 'NONE':
            raise ValueError('invalid_audio')
        pcm = wav.readframes(frames)
        if len(pcm) != frames * 2:
            raise ValueError('invalid_audio')
    path = Path(model_path)
    if not path.is_dir() or not all((path / name).is_file() for name in ('model.bin', 'config.json', 'tokenizer.json')):
        raise ValueError('model_missing')
    if engine is None:
        import numpy as np
        from faster_whisper import WhisperModel
        model = WhisperModel(str(path.resolve()), device='cpu', compute_type='int8', cpu_threads=2, num_workers=1, local_files_only=True)
        samples = np.frombuffer(pcm, dtype='<i2').astype(np.float32) / 32768.0
        segments, info = model.transcribe(samples, language=None if payload['language'] == 'auto' else payload['language'], task='transcribe', beam_size=3, vad_filter=True, condition_on_previous_text=False)
    else:
        segments, info = engine(pcm, payload['language'])
    text = ''
    count = 0
    for segment in segments:
        count += 1
        if count > 200 or not isinstance(segment.text, str):
            raise ValueError('invalid_transcript')
        text += segment.text + ' '
        if len(text) > 4000:
            raise ValueError('transcript_too_large')
    return {'text': text.strip(), 'final': True, 'language': str(info.language)[:12], 'durationSeconds': frames / 16000, 'engine': 'faster-whisper-local', 'reviewRequired': True}

def main():
    # Offline flags are defense in depth; only an existing filesystem model is accepted.
    os.environ['HF_HUB_OFFLINE'] = '1'
    os.environ['TRANSFORMERS_OFFLINE'] = '1'
    try:
        raw = sys.stdin.buffer.read(MAX_INPUT + 1)
        if len(raw) > MAX_INPUT or len(sys.argv) != 2:
            raise ValueError('invalid_request')
        payload = json.loads(raw)
        # Third-party progress/log output never joins the JSON protocol or audit stream.
        import contextlib
        with open(os.devnull, 'w') as sink, contextlib.redirect_stdout(sink), contextlib.redirect_stderr(sink):
            result = transcribe(payload, sys.argv[1])
        print(json.dumps(result, ensure_ascii=True))
    except Exception:
        print(json.dumps({'error': 'local_transcription_failed'}))
        sys.exit(1)

if __name__ == '__main__':
    main()
