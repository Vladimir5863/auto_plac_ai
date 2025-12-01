try:
    from app.main import app
    print("SUCCESS: FastAPI app imported")
except Exception as e:
    print("ERROR:", str(e))
    import traceback
    traceback.print_exc()
