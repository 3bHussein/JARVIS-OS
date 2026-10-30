import base64
import io
from pathlib import Path
import tempfile
import subprocess
import json
import sys
from types import SimpleNamespace
import unittest
import wave
from worker import transcribe

class WorkerContract(unittest.TestCase):
    def payload(self, seconds=1):
        stream = io.BytesIO()
        with wave.open(stream, 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(16000)
            wav.writeframes(b'\0\0' * int(seconds * 16000))
        return {'audio': base64.b64encode(stream.getvalue()).decode(), 'language': 'ar'}

    def test_final_review_and_empty_vad_result(self):
        with tempfile.TemporaryDirectory() as directory:
            [Path(directory, name).touch() for name in ('model.bin', 'config.json', 'tokenizer.json')]
            seen = []
            def engine(pcm, language):
                seen.append((len(pcm), language))
                return iter([SimpleNamespace(text='صباح الخير')]), SimpleNamespace(language='ar')
            result = transcribe(self.payload(), directory, engine)
            self.assertEqual(result['text'], 'صباح الخير')
            self.assertTrue(result['reviewRequired'])
            self.assertEqual(seen, [(32000, 'ar')])
            result = transcribe(self.payload(), directory, lambda *_: (iter([]), SimpleNamespace(language='ar')))
            self.assertEqual(result['text'], '')

    def test_rejects_invalid_audio_language_duration_and_missing_model(self):
        with tempfile.TemporaryDirectory() as directory:
            [Path(directory, name).touch() for name in ('model.bin', 'config.json', 'tokenizer.json')]
            for payload in [{'audio': 'bad', 'language': 'ar'}, {**self.payload(), 'language': 'shell'}, self.payload(31)]:
                with self.assertRaises(Exception):
                    transcribe(payload, directory, lambda *_: self.fail('Engine must not run'))
            with self.assertRaises(ValueError):
                transcribe(self.payload(), str(Path(directory, 'missing')))
            Path(directory, 'tokenizer.json').unlink()
            with self.assertRaises(ValueError):
                transcribe(self.payload(), directory, lambda *_: self.fail('Tokenizer fallback must not run'))

    def test_cli_failure_is_normalized_without_traceback_or_paths(self):
        result = subprocess.run([sys.executable, '-I', '-B', str(Path(__file__).with_name('worker.py')), '/synthetic-private-missing-model'], input=json.dumps(self.payload()).encode(), stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(json.loads(result.stdout), {'error': 'local_transcription_failed'})
        self.assertEqual(result.stderr, b'')

    def test_bounds_lazy_segment_output(self):
        with tempfile.TemporaryDirectory() as directory:
            [Path(directory, name).touch() for name in ('model.bin', 'config.json', 'tokenizer.json')]
            with self.assertRaises(ValueError):
                transcribe(self.payload(), directory, lambda *_: (iter([SimpleNamespace(text='x' * 4001)]), SimpleNamespace(language='en')))

if __name__ == '__main__':
    unittest.main()
