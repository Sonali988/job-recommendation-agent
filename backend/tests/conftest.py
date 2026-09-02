import os
import sys

# Ensure the backend package root is importable when running pytest from anywhere.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
