from mangum import Mangum
from api.app import app

# Vercel will use the exported handler
handler = Mangum(app)
