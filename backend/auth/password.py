def hash_password(password: str) -> str:
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return True if plain_password == hashed_password else False