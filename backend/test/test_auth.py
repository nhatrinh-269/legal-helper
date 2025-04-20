from auth.password import hash_password, verify_password

def test_password_hash_and_verify():
    raw = "123456"
    hashed = hash_password(raw)

    assert hashed != raw
    assert verify_password("123456", hashed)
    assert not verify_password("wrongpass", hashed)
