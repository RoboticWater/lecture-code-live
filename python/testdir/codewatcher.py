import time, sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests
import mimetypes


class Watcher:
	DIRECTORY = sys.argv[1] if len(sys.argv) > 1 else './testdir'
	def __init__(self):
		self.observer = Observer()

	def run(self):
		event_handler = Handler()
		self.observer.schedule(event_handler, self.DIRECTORY, recursive=True)
		self.observer.start()
		try:
			while True:
				time.sleep(5)
		except:
			self.observer.stop()
			print("Error")

		self.observer.join()


class Handler(FileSystemEventHandler):

	@staticmethod
	def on_any_event(event):
		if event.is_directory:
			return None
		elif event.event_type == 'created':
			# Take any action here when a file is first created.
			print("[watch] Received created event - %s." % event.src_path)
			req = requests.post('http://localhost:3001/api/upload', 
				data={"filepath": event.src_path}, 
				files={'file': 
				(event.src_path.split('\\')[-1], 
					open(event.src_path, 'rb'), 
					mimetypes.guess_type(event.src_path.split('\\')[-1])[0])})

		elif event.event_type == 'modified':
			# Taken any action here when a file is modified.
			print("[watch] Received modified event - %s." % event.src_path)
			print(mimetypes.guess_type(event.src_path.split('\\')[-1]))
			# print(event.src_path.split('\\'))
			req = requests.post('http://localhost:3001/api/upload', 
				data={"filepath": event.src_path}, 
				files={'file': 
				(event.src_path.split('\\')[-1], 
					open(event.src_path, 'rb'), 
					mimetypes.guess_type(event.src_path.split('\\')[-1])[0])})


if __name__ == '__main__':
	w = Watcher()
	print("[watch] Starting watcher...")
	w.run()