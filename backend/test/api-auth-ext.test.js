import { expect } from "chai";
import supertest from "supertest";

const request = supertest("http://localhost:3001");

describe("*** TEST DEL SERVICIO API AUTH (ext) ***", () => {
  describe("POST /api/auth/login", () => {
    it("debería loguear un usuario válido y devolver un token", async () => {
      const loginData = {
        email: "alumno@test.com",
        password: "123456",
      };

      const response = await request.post("/api/auth/login").send(loginData);

      expect(response.status).to.eql(200);
      expect(response.body).to.include.keys("user", "token");

      const { user, token } = response.body;

      expect(user).to.include.keys("id", "email", "rol");
      expect(token).to.be.a("string");
    });

    it("debería devolver 401 si las credenciales son incorrectas", async () => {
      const response = await request.post("/api/auth/login").send({
        email: "alumno1@fitandtrack.com",
        password: "password-incorrecto",
      });

      expect(response.status).to.eql(401);
      expect(response.body).to.have.property("message");
    });
  });

  describe("GET /api/auth/me", () => {
    it("debería devolver el perfil del usuario logueado", async () => {
      const loginResp = await request.post("/api/auth/login").send({
        email: "entrenador@test.com",
        password: "123456",
      });

      expect(loginResp.status).to.eql(200);
      const token = loginResp.body.token;

      // 2) llamar a /me con el token
      const response = await request
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).to.eql(200);
      expect(response.body).to.have.property("user");
      const user = response.body.user;

      expect(user).to.include.keys("id", "email", "rol");
    });
  });
});
