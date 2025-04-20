def test_register_and_login(client):
    # register
    res = client.post("/api/v1/user/register", json={
        "full_name": "Trinh Test",
        "email": "trinh@test.com",
        "password": "123456"
    })
    assert res.status_code == 201

    # login
    res = client.post("/api/v1/auth/login", data={
        "username": "trinh@test.com",
        "password": "123456"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()
