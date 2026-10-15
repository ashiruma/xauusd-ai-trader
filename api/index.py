from api.app import app

# Vercel natively executes ASGI apps via 'app'
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = app

