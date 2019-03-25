import time, sys, os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import requests, json
import mimetypes
import argparse


url = 'https://lecturecode.herokuapp.com/api' #'http://localhost:3001/api'

parser = argparse.ArgumentParser()
parser.add_argument("-d", "--delete", help="delete all files",
	action="store_true")
parser.add_argument('-l', '--launch_directory', dest="directory",type=str, action="store", default='./testdir')
args = parser.parse_args()

if args.delete:
	r = requests.get(url + '/files/')
	for file in r.json():
		requests.delete(url + '/files/' + file['filename'])
	print('done')
	sys.exit(0)

os.chdir(args.directory.replace('~', os.path.expanduser("~")))

class Watcher:
	def __init__(self):
		self.observer = Observer()

	def run(self):
		event_handler = Handler()
		self.observer.schedule(event_handler, args.directory.replace('~', os.path.expanduser("~")), recursive=True)
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
		relative_path = event.src_path.replace(args.directory.replace('~', os.path.expanduser("~")), '')
		if event.is_directory:
			return None
		elif '.DS_Store' in relative_path:
			return None
		elif event.event_type == 'deleted':
			print("[watch] Received deleted event - %s." % relative_path)
			req = requests.post(url + '/files/deletepath',
				json={"filepath": relative_path})
		elif event.event_type == 'created':
			# Take any action here when a file is first created.
			print("[watch] Received created event - %s." % relative_path)
			req = requests.post(url + '/upload', 
				data={"filepath": relative_path}, 
				files={'file': 
				(relative_path.split('\\')[-1], 
					open(event.src_path, 'rb'), 
					mimetypes.guess_type(event.src_path.split('\\')[-1])[0])})
		elif event.event_type == 'modified':
			# Taken any action here when a file is modified.
			print("[watch] Received modified event - %s." % relative_path)
			# print(src_path.split('\\'))
			req = requests.post(url + '/upload', 
				data={"filepath": relative_path}, 
				files={'file': 
				(event.src_path.split('\\')[-1], 
					open(event.src_path, 'rb'), 
					mimetypes.guess_type(event.src_path.split('\\')[-1])[0])})


if __name__ == '__main__':
	w = Watcher()
	print("[watch] Starting watcher...")
	w.run()