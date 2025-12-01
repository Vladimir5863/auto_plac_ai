import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

try:
    from database import Base
    print("Database import successful")

    from schemas import User
    print("Schemas import successful")

    from pydantic_models import User as PydanticUser
    print("Pydantic models import successful")

    from auth import authenticate_user
    print("Auth import successful")

    from routers.users import router
    print("Users router import successful")

    print("All imports successful!")

except Exception as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()
