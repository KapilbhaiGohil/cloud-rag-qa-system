def success_response(message: str, data: dict = None):
    return {
        "success": True,
        "message": message,
        "data": data or {}
    }

def error_response(message: str, errors: dict = None):
    return {
        "success": False,
        "message": message,
        "errors": errors or {}
    }
